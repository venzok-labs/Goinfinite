"use client";

import { useEffect, useRef, useState } from "react";

// Distance/velocity past which a release counts as a completed swipe rather
// than a tap or a small nudge that should spring back.
const SWIPE_THRESHOLD_PX = 100;
const SWIPE_VELOCITY_PX_MS = 0.5;
const ROTATE_FACTOR = 0.06; // deg of tilt per px dragged horizontally
const ROTATE_MAX = 18; // cap so a long drag stays a "subtle" tilt, not a cartwheel
const FLY_MS = 380;
const SPRING_BACK_MS = 340;
const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // slight overshoot — a spring, not a linear slide
const FLY_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Resting geometry of the stack, one card-position back from the top ("idx"
// counts back from the active card at idx 0): each step back sits a little
// lower and a little smaller, which is what actually reads as "a deck", not
// just a plain drop-shadow.
const STACK_STEP_Y = 14;
const STACK_STEP_SCALE = 0.055;
const STACK_STEP_OPACITY = 0.08;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// Eases the raw drag-distance ratio before it drives the stack's
// grow-into-place motion — a straight linear mapping made the card behind
// feel like it was ticking up in lockstep with the pointer rather than
// genuinely rising into place; easing it out gives that motion its own
// slight "settle" instead of tracking the drag pixel-for-pixel.
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// The resting transform of the card sitting `idx` positions back from the
// top of the deck (idx 0 = the active card itself, fully in place).
function restingAt(idx) {
  return {
    y: idx * STACK_STEP_Y,
    scale: 1 - idx * STACK_STEP_SCALE,
    opacity: 1 - idx * STACK_STEP_OPACITY,
  };
}

// Resolves once the element's own transform transition ends (not a
// transition bubbling up from some other descendant), falling back to a
// timer a little past the expected duration in case the browser never
// fires transitionend at all (an interrupted/replaced transition, a
// reduced-motion 0ms duration, etc.) — whichever happens first wins and
// cancels the other, so this never double-fires and never hangs.
function onSettled(el, ms, callback) {
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    el.removeEventListener("transitionend", onEnd);
    window.clearTimeout(timer);
    callback();
  }
  function onEnd(e) {
    if (e.target === el && e.propertyName === "transform") finish();
  }
  el.addEventListener("transitionend", onEnd);
  const timer = window.setTimeout(finish, ms + 60);
}

/*
 * A physical-feeling stacked deck (see the Dribbble "Find Your Furry
 * Friend" swipe pattern this is modeled on) — NOT a horizontal carousel.
 * Only the active (top) card is draggable; 2-3 cards sit behind it, each a
 * little smaller/lower, so the next one is always visibly peeking out.
 *
 * Three things are all tied to the *same* live drag distance, exactly like
 * a real deck being fanned by hand:
 *   1. the active card translates with the pointer and tilts proportionally
 *   2. the card directly behind it grows/rises toward the active card's
 *      resting spot, and every other card behind that shifts up one slot,
 *      in lockstep — not a discrete swap that only happens after release
 *   3. crossing the threshold (distance OR velocity) commits: the active
 *      card is released to fly the rest of the way off-screen and the whole
 *      stack settles into its promoted (one card advanced) arrangement;
 *      falling short springs everything — position, tilt, and the stack
 *      behind it — back to exactly where it started.
 *
 * All of this is written straight to each card's DOM style during the drag
 * (via refs), not through React state, so the pointer gets same-frame
 * feedback with no per-pixel re-render — only the eventual "which item is
 * active now" reorder, once a swipe actually completes, goes through state.
 * By default a dealt-with card is simply removed — once every item has been
 * swiped through once, `endContent` (or a plain built-in "you've seen them
 * all" card with a restart button) takes its place. Pass `loop` to go back
 * to recycling dealt cards to the back of the deck instead, for a set that's
 * genuinely meant to cycle forever.
 *
 * Two things specifically earn the "smooth" in a real browser (as opposed
 * to a quick correctness check) rather than the physics above:
 *  - Pointer-move updates are coalesced to one write per animation frame
 *    (`rafRef`) instead of one per raw pointermove event — a touchscreen or
 *    a fast mouse can fire those well above 60Hz, and applying every single
 *    one synchronously is what actually reads as stutter, not the math.
 *  - `will-change: transform` on every card gives the browser a standing
 *    heads-up to promote them to their own compositor layer up front,
 *    instead of doing that promotion (a jank-prone step) on the first
 *    frame a drag actually starts.
 */
export default function SwipeDeck({
  items,
  getKey,
  renderCard,
  visibleCount = 3,
  className = "",
  loop = false,
  endContent,
}) {
  const [deck, setDeck] = useState(items);
  const topRef = useRef(null);
  const stackRefs = useRef([]); // stackRefs.current[idx], idx 1..visibleCount-1
  const dragRef = useRef(null); // { startX, startY, startTime } while a drag is live
  const settlingRef = useRef(false); // true while a fly-off/spring-back animation is still playing
  const rafRef = useRef(null); // pending "apply the latest pointer position" frame
  const pendingRef = useRef(null); // latest {dx, dy} not yet painted

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  function forEachStackCard(fn) {
    for (let idx = 1; idx < visibleCount; idx++) {
      const el = stackRefs.current[idx];
      if (el) fn(el, idx);
    }
  }

  // progress 0 = resting (deck untouched), 1 = fully promoted (as if the
  // active card had already been swiped away and every card behind it had
  // already moved up one slot) — driven live by drag distance while
  // dragging, then animated to 0 or 1 on release.
  function applyStackProgress(progress) {
    forEachStackCard((el, idx) => {
      const from = restingAt(idx);
      const to = restingAt(idx - 1);
      const y = from.y + (to.y - from.y) * progress;
      const scale = from.scale + (to.scale - from.scale) * progress;
      const opacity = from.opacity + (to.opacity - from.opacity) * progress;
      el.style.transform = `translateY(${y}px) scale(${scale})`;
      el.style.opacity = String(opacity);
    });
  }

  function setStackTransition(transition) {
    forEachStackCard((el) => {
      el.style.transition = transition;
    });
  }

  // The one place that actually writes the drag's live transform/progress
  // to the DOM — always called from inside a rAF callback (see
  // onPointerMove), never straight from the pointer event itself.
  function paintDrag(dx, dy) {
    const el = topRef.current;
    if (!el) return;
    const rotate = clamp(dx * ROTATE_FACTOR, -ROTATE_MAX, ROTATE_MAX);
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
    applyStackProgress(easeOutCubic(clamp(Math.abs(dx) / SWIPE_THRESHOLD_PX, 0, 1)));
  }

  function onPointerDown(e) {
    const el = topRef.current;
    // Also refuses a *second* finger (or a stray palm touch) that lands on
    // the card mid-gesture: without this, that second pointerdown would
    // silently overwrite dragRef's startX/startY while the first finger's
    // pointermove/pointerup — still captured to it, per setPointerCapture
    // below — kept firing against the new, unrelated start point. That
    // mismatch is exactly the kind of thing that reads as "I swiped right
    // but it flew off left": the release math ends up measured against the
    // wrong finger's starting position.
    if (!el || settlingRef.current || dragRef.current) return;
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startTime: performance.now() };
    el.style.transition = "none";
    setStackTransition("none");
    el.classList.add("cursor-grabbing");
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {
      /* no-op */
    }
  }

  function onPointerMove(e) {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    pendingRef.current = { dx: e.clientX - drag.startX, dy: e.clientY - drag.startY };
    if (rafRef.current) return; // a frame is already queued — it'll pick up the latest pending value
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingRef.current) paintDrag(pendingRef.current.dx, pendingRef.current.dy);
    });
  }

  function endDrag(e, { cancelled }) {
    const drag = dragRef.current;
    const el = topRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    pendingRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!el) return;
    el.classList.remove("cursor-grabbing");

    // A `pointercancel` (the browser handing the gesture to something else
    // mid-touch — a native back/forward swipe, an OS gesture, another
    // pointer taking over) is not a genuine release, and its coordinates
    // aren't reliable: several browsers report `pointercancel` at (0, 0)
    // regardless of where the finger actually was. Computing "which way did
    // they swipe" from that would make it look like every cancelled touch
    // flew off to whichever side is more negative than the start point —
    // on a phone, that's almost always left. Only a real `pointerup` is
    // trusted to decide the swipe; any cancel always just springs back.
    if (cancelled) {
      springBack(el);
      return;
    }

    const dx = e.clientX - drag.startX;
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const velocity = Math.abs(dx) / elapsed;
    const passedThreshold = Math.abs(dx) > SWIPE_THRESHOLD_PX || velocity > SWIPE_VELOCITY_PX_MS;

    if (passedThreshold) {
      flyOff(el, dx >= 0 ? 1 : -1);
    } else {
      springBack(el);
    }
  }

  function onPointerUp(e) {
    endDrag(e, { cancelled: false });
  }

  function onPointerCancel(e) {
    endDrag(e, { cancelled: true });
  }

  // Swipe cancelled short of the threshold: the active card returns to
  // exactly center with 0deg rotation, and the stack behind it un-promotes
  // back to its original resting arrangement, in lockstep with it.
  function springBack(el) {
    settlingRef.current = true;
    el.style.transition = `transform ${SPRING_BACK_MS}ms ${SPRING_EASE}`;
    el.style.transform = "translate(0px, 0px) rotate(0deg)";
    setStackTransition(`transform ${SPRING_BACK_MS}ms ${SPRING_EASE}, opacity ${SPRING_BACK_MS}ms ${SPRING_EASE}`);
    applyStackProgress(0);
    onSettled(el, SPRING_BACK_MS, () => {
      settlingRef.current = false;
    });
  }

  // Swipe committed: the active card is released the rest of the way off
  // (~100vw, well clear of the viewport regardless of where the drag left
  // it) while the stack finishes promoting in sync, then the dealt card
  // cycles to the back of the deck and the next one becomes active.
  function flyOff(el, dir) {
    settlingRef.current = true;
    const flyX = dir * (window.innerWidth + 240);
    el.style.transition = `transform ${FLY_MS}ms ${FLY_EASE}, opacity ${FLY_MS}ms ease-out`;
    el.style.transform = `translate(${flyX}px, ${dir * 30}px) rotate(${dir * 26}deg)`;
    el.style.opacity = "0";
    setStackTransition(`transform ${FLY_MS}ms ${FLY_EASE}, opacity ${FLY_MS}ms ease-out`);
    applyStackProgress(1);
    onSettled(el, FLY_MS, () => {
      // Only the *transition* gets cleared here — deliberately NOT the
      // transform/opacity values themselves. Each stack card was just
      // animated to `restingAt(idx - 1)`, which by construction is exactly
      // the resting style its promoted slot will render on the next line —
      // so leaving those values in place means the upcoming re-render finds
      // nothing to change for them and paints nothing new at all. Clearing
      // them to "" instead (as this used to do) was the flicker itself:
      // every card would snap to an untransformed, fully-opaque identity
      // style for the one frame between that reset and React's next paint,
      // before the "real" reordered styles landed — a visible flash right
      // as the deck advances. Resetting only the transition still matters,
      // so a value that *does* end up changing on the next render (e.g. the
      // dealt card, if it's still in view deeper in the stack) snaps
      // straight there instead of replaying an animation from these
      // now-stale numbers.
      el.style.transition = "none";
      setStackTransition("none");
      settlingRef.current = false;
      setDeck((prev) => {
        const [dealt, ...rest] = prev;
        return loop ? [...rest, dealt] : rest;
      });
    });
  }

  function onKeyDown(e) {
    const el = topRef.current;
    if (!el || settlingRef.current) return;
    if (e.key === "ArrowLeft") flyOff(el, -1);
    else if (e.key === "ArrowRight") flyOff(el, 1);
  }

  const visible = deck.slice(0, Math.min(visibleCount, deck.length));

  if (visible.length === 0) {
    return (
      <div className={`relative ${className}`}>
        {endContent ? (
          endContent(() => setDeck(items))
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-white p-8 text-center shadow-[0_20px_44px_-24px_rgba(11,42,74,0.35)]">
            <p className="text-[15px] text-steel">You've gone through all of them.</p>
            <button type="button" onClick={() => setDeck(items)} className="btn btn-primary">
              Start Over
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    // `overscroll-behavior: contain` keeps a fast/edge-adjacent swipe from
    // also triggering the page's own scroll bounce or a browser back/
    // forward navigation swipe underneath the deck — either of those
    // competing with this gesture is another way a touch can end up
    // resolved as a `pointercancel` (see endDrag's own comment on that).
    <div className={`relative overscroll-x-contain ${className}`}>
      {visible
        .map((item, idx) => ({ item, idx }))
        .reverse()
        .map(({ item, idx }) => {
          const isTop = idx === 0;
          const resting = restingAt(idx);
          return (
            <div
              key={getKey(item)}
              ref={(el) => {
                if (isTop) topRef.current = el;
                else stackRefs.current[idx] = el;
              }}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerCancel : undefined}
              tabIndex={isTop ? 0 : -1}
              onKeyDown={isTop ? onKeyDown : undefined}
              role={isTop ? "group" : undefined}
              aria-roledescription={isTop ? "swipeable card" : undefined}
              aria-label={isTop ? "Swipe left or right, or use the arrow keys, to browse" : undefined}
              className={`absolute inset-0 touch-none select-none will-change-transform [backface-visibility:hidden] ${
                isTop ? "cursor-grab" : "pointer-events-none"
              }`}
              style={{
                zIndex: visibleCount - idx,
                transform: isTop ? undefined : `translateY(${resting.y}px) scale(${resting.scale})`,
                opacity: isTop ? undefined : resting.opacity,
              }}
            >
              {renderCard(item)}
            </div>
          );
        })}
    </div>
  );
}
