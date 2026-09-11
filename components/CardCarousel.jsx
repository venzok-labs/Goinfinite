"use client";

import { useEffect, useRef } from "react";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/*
 * Shared drag-to-swipe carousel — cards snap into place one at a time,
 * dragged with a mouse or swiped on touch (native overflow-x scrolling
 * handles touch for free). Used by both WhatWeDo and ProjectBanner so they
 * share one "browse a set of items" pattern instead of two different
 * mechanics. Three animation layers:
 *  - Entrance: cards fade/slide in with a stagger the first time the
 *    carousel scrolls into view (IntersectionObserver, once).
 *  - Focus: whichever card sits nearest the frame's center scales up with a
 *    lifted shadow; neighbors shrink/dim proportionally to their distance.
 *    Recomputed on every scroll tick (rAF-throttled) by writing directly to
 *    each card's own DOM style — not through React state — so dragging
 *    doesn't trigger a re-render per pixel.
 *  - Buttons: the prev/next arrows lift and nudge their icon on hover. Next
 *    from the last card wraps around to the first, and Prev from the first
 *    card wraps to the last — the carousel loops rather than dead-ending.
 *
 * `paddingClassName` is a small fixed edge inset (not a percentage) so the
 * first card rests flush at the start on load — no big empty gap before it
 * — and the last card ends flush at the finish. Earlier this used
 * `calc(50% - half a card)` padding to let every card reach a fully
 * *centered* scroll position, but at wide viewports that padding itself
 * became a large empty margin before the first card on initial load, which
 * read as broken. `scrollByCard` still aims each target at the viewport's
 * center; the browser simply clamps that to the nearest valid scroll
 * position at either end, which is exactly the flush start/end we want.
 */
export default function CardCarousel({
  items,
  getKey,
  renderCard,
  hint,
  cardClassName = "h-[300px] w-[340px] max-[560px]:w-[86vw]",
  paddingClassName = "pl-8 pr-8 max-[720px]:pl-5 max-[720px]:pr-5",
  // Optional "⟲ Back to start" control next to the hint text — the Next
  // button already wraps last→first, but that's only discoverable by
  // clicking through every card; callers with a lot of cards (Industries'
  // mobile view) pass a label here to give a direct one-tap way back to the
  // first card instead of relying on that wrap-around.
  restartLabel,
}) {
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const handleRef = useRef(null);
  const activeIndexRef = useRef(0);
  const scrollAnimRef = useRef(null);
  // While a button-driven animation is in flight, the *target* card is
  // already known for certain (scrollByCard just set it) — but the
  // animation moving scrollLeft fires ordinary "scroll" events on nearly
  // every frame same as a real drag would, and updateFocus normally
  // treats those as "figure out which card the user scrolled to" and
  // overwrites activeIndexRef with its own geometric guess. Read mid-flight
  // — before the animation has actually reached its target — that guess is
  // wrong, and it was clobbering the correct target right out from under
  // it, which is what let a second click land on the wrong "current" card
  // and appear to skip one. This flag tells updateFocus to keep animating
  // the visual dimming (that's harmless either way) but leave
  // activeIndexRef alone until the animation's own final correction.
  const suppressFocusIndexRef = useRef(false);
  const count = items.length;

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = cardRefs.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function cardStep() {
      const a = cards[0];
      const b = cards[1];
      return a && b ? b.offsetLeft - a.offsetLeft : 0;
    }

    let focusRaf = null;
    function updateFocus() {
      focusRaf = null;
      const step = cardStep();
      if (!step) return;

      const atStart = carousel.scrollLeft <= 1;
      const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;

      // Measured with offsetLeft (plain layout position, relative to the
      // carousel itself — it's the offsetParent via the `relative` class
      // above) against scrollLeft, NOT getBoundingClientRect against the
      // frame's edge. The unfocused cards are visually shrunk with
      // `transform: scale(...)` below, and getBoundingClientRect reflects
      // that shrink — so measuring "nearest" that way was reading each
      // card's own dimming effect back into the very calculation that
      // decides the dimming, a feedback loop that could land on a card 1-2
      // past the one scrollByCard had actually aimed for. offsetLeft is a
      // pure layout value, untouched by transform, so it isn't distorted by
      // its own output.
      const insetLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;
      const referenceOffset = carousel.scrollLeft + insetLeft;

      let nearestIdx = 0;
      let nearestDist = Infinity;
      cards.forEach((card, i) => {
        if (!card) return;
        const dist = Math.abs(card.offsetLeft - referenceOffset);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      });
      if (atStart) nearestIdx = 0;
      if (atEnd) nearestIdx = count - 1;

      // Scale/opacity falloff is driven by distance *from the active card's
      // index*, not raw pixel distance from the frame's center — this frame
      // is wide enough to show several cards at once, so the card nearest
      // the geometric center is rarely the one that's actually flush at the
      // start (e.g. card 1 on load, at scrollLeft 0). Tying the "prominent"
      // card here to whichever index atStart/atEnd/the nearest-search above
      // decided is active keeps the highlight and the scale/opacity in
      // agreement — previously they could disagree, which showed up as the
      // wrong card looking selected on load.
      cards.forEach((card, i) => {
        if (!card) return;
        const norm = Math.min(1, Math.abs(i - nearestIdx) * 0.6);
        if (!reduced) {
          card.style.transform = `translateY(0) scale(${(1 - norm * 0.14).toFixed(3)})`;
          card.style.opacity = (1 - norm * 0.55).toFixed(3);
        }
      });

      cards.forEach((card, i) => card?.classList.toggle("shadow-[0_26px_54px_-18px_rgba(11,42,74,0.5)]", i === nearestIdx));
      // See suppressFocusIndexRef's own comment — while a button's animation
      // is still in flight, don't let this geometric guess (which can be
      // reading a mid-animation scrollLeft) overwrite the target it already
      // knows for certain.
      if (!suppressFocusIndexRef.current) activeIndexRef.current = nearestIdx;
      updateProgress();
    }
    // A real seek bar, like an audio player's scrubber: the fill/handle
    // sit at a single position representing how far through the whole
    // track you are (scrollLeft / maxScroll), not "how much of the track
    // is currently visible" — that's what makes it draggable to any point.
    function updateProgress() {
      const fill = fillRef.current;
      const handle = handleRef.current;
      if (!fill || !handle) return;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const progress = maxScroll > 0 ? carousel.scrollLeft / maxScroll : 0;
      const pct = `${(progress * 100).toFixed(2)}%`;
      fill.style.width = pct;
      handle.style.left = pct;
    }
    function requestFocusUpdate() {
      if (focusRaf) return;
      focusRaf = requestAnimationFrame(updateFocus);
    }
    carousel.addEventListener("scroll", requestFocusUpdate, { passive: true });
    window.addEventListener("resize", requestFocusUpdate);
    updateProgress();

    const entranceIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          cards.forEach((card, i) => {
            if (!card) return;
            setTimeout(
              () => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0) scale(1)";
                // Each staggered entrance write unconditionally set full
                // opacity/scale, which — for every card but the last —
                // landed AFTER updateFocus()'s own dimming below and
                // silently erased it. That's why the "active" card's
                // highlight never actually stuck once the entrance
                // animation finished: everything settled back to full
                // brightness regardless of which card should be prominent.
                // Re-running it after each card's own write keeps the
                // correct card dimmed once the stagger settles.
                updateFocus();
              },
              reduced ? 0 : i * 90
            );
          });
          updateFocus();
          entranceIo.disconnect();
        });
      },
      { threshold: 0.3 }
    );
    entranceIo.observe(carousel);

    let isDown = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;
    function onDown(e) {
      isDown = true;
      dragged = false;
      // Restores the native settle-to-nearest-card snap for this drag, in
      // case a track-scrub left it switched off (see onTrackUp above).
      carousel.style.scrollSnapType = "";
      carousel.classList.add("cursor-grabbing");
      startX = e.pageX;
      startScroll = carousel.scrollLeft;
      // Cards are whole-card <Link>s with a background image — without this,
      // clicking and moving the mouse over one starts the browser's native
      // "drag a ghost image out of the link" gesture instead of firing
      // continuous mousemove events, which silently swallows our own
      // drag-to-scroll (clicking alone still worked, dragging didn't).
      e.preventDefault();
    }
    function onUp(e) {
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove("cursor-grabbing");
      // A drag that actually moved the track shouldn't also fire the card's
      // link navigation underneath the pointer.
      if (dragged && e.target.closest("a")) e.preventDefault();
      requestFocusUpdate();
    }
    function onMove(e) {
      if (!isDown) return;
      const delta = e.pageX - startX;
      // Trackpad clicks (Mac especially) nudge the cursor a few pixels as
      // part of the physical click itself, well past a couple of pixels —
      // a low threshold here was misreading plain clicks on the carousel's
      // cards as drags and swallowing their navigation.
      if (Math.abs(delta) > 10) dragged = true;
      carousel.scrollLeft = startScroll - delta;
    }
    function onClickCapture(e) {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    carousel.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    carousel.addEventListener("click", onClickCapture, true);

    // Lets a trackpad/mouse wheel scroll the track horizontally even though
    // wheel input is normally vertical — without this, hovering the
    // carousel and scrolling just scrolls the page past it instead.
    function onWheel(e) {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      e.preventDefault();
      carousel.scrollLeft += e.deltaY;
    }
    carousel.addEventListener("wheel", onWheel, { passive: false });

    // ---- the track itself is a real scrubber, like an audio player's seek
    // bar: click anywhere on it to jump straight there, or grab the handle
    // and drag to scrub — previously the track only ever displayed
    // progress, it had no interaction at all. ----
    const track = trackRef.current;
    let seeking = false;
    function seekTo(clientX) {
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = rect.width ? Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) : 0;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      carousel.scrollLeft = ratio * maxScroll;
      // scrollLeft doesn't always fire a "scroll" event synchronously, and
      // dragging needs the fill/handle to track the pointer every frame
      // regardless — so update them directly here too.
      updateProgress();
    }
    function onTrackDown(e) {
      seeking = true;
      // scroll-snap-type fights a direct scrollLeft assignment — setting it
      // to some in-between value gets silently snapped back to the nearest
      // card immediately, which is exactly why dragging the bar felt like it
      // wasn't working. Switched off for the duration of the scrub, restored
      // on release so normal card-swipe snapping still applies otherwise.
      carousel.style.scrollSnapType = "none";
      // No transition lag while actively scrubbing — the handle should
      // track the pointer 1:1, same as dragging a real playback scrubber.
      if (fillRef.current) fillRef.current.style.transitionDuration = "0ms";
      if (handleRef.current) handleRef.current.style.transitionDuration = "0ms";
      seekTo(e.clientX);
      try {
        track.setPointerCapture(e.pointerId);
      } catch (err) {
        /* no-op */
      }
      e.preventDefault();
    }
    function onTrackMove(e) {
      if (!seeking) return;
      seekTo(e.clientX);
    }
    function onTrackUp() {
      if (!seeking) return;
      seeking = false;
      // Deliberately NOT re-enabling scroll-snap here — a real scrubber
      // stays exactly where you drop it. Re-enabling it immediately made
      // Chromium instantly re-apply snap correction and jump to the
      // nearest card, undoing the whole point of dragging to a spot
      // in-between. It's restored instead the next time someone actually
      // drags a card by hand (see onDown below), which is where the
      // familiar "settle after a swipe" feel actually belongs.
      if (fillRef.current) fillRef.current.style.transitionDuration = "";
      if (handleRef.current) handleRef.current.style.transitionDuration = "";
      requestFocusUpdate();
    }
    if (track) {
      track.addEventListener("pointerdown", onTrackDown);
      track.addEventListener("pointermove", onTrackMove);
      track.addEventListener("pointerup", onTrackUp);
      track.addEventListener("pointercancel", onTrackUp);
    }

    return () => {
      if (focusRaf) cancelAnimationFrame(focusRaf);
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      carousel.removeEventListener("scroll", requestFocusUpdate);
      window.removeEventListener("resize", requestFocusUpdate);
      carousel.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      carousel.removeEventListener("click", onClickCapture, true);
      carousel.removeEventListener("wheel", onWheel);
      if (track) {
        track.removeEventListener("pointerdown", onTrackDown);
        track.removeEventListener("pointermove", onTrackMove);
        track.removeEventListener("pointerup", onTrackUp);
        track.removeEventListener("pointercancel", onTrackUp);
      }
      entranceIo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  function scrollByCard(dir) {
    const current = activeIndexRef.current;
    const target = dir === 1 ? (current === count - 1 ? 0 : current + 1) : current === 0 ? count - 1 : current - 1;
    goToIndex(target);
  }

  // Shared by scrollByCard (±1, wrapping) and the optional restart button
  // (always index 0) — everything below only cares about the destination
  // index, not how it was chosen.
  function goToIndex(target) {
    const carousel = carouselRef.current;
    const cards = cardRefs.current;
    activeIndexRef.current = target;
    // A rapid second click cancels this animation below and starts a fresh
    // one — suppression should span that too, so it's only ever lifted once
    // an animation actually reaches its target uninterrupted.
    suppressFocusIndexRef.current = true;

    const targetCard = cards[target];
    if (!carousel || !targetCard) {
      suppressFocusIndexRef.current = false;
      return;
    }
    // Align the target card's own left edge flush with the frame's visible
    // start (minus the edge inset), not centered in the frame — this frame
    // is wide enough to show several cards at once, so "center the target
    // card" barely moves scrollLeft for the first couple of clicks, which
    // read as the buttons doing nothing. Index 0 always rests at scrollLeft
    // 0 so the edge inset stays visible, matching every other section.
    // Measured via getBoundingClientRect, not offsetLeft — offsetLeft is
    // relative to the card's nearest *positioned* ancestor, which isn't
    // necessarily this carousel, so it isn't reliably "distance from the
    // scrollable frame's own edge."
    const insetLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;
    const cardOffsetInScroller = targetCard.getBoundingClientRect().left - carousel.getBoundingClientRect().left + carousel.scrollLeft;
    const left = target === 0 ? 0 : cardOffsetInScroller - insetLeft;

    // Animated by hand rather than `scrollTo({behavior:"smooth"})` — native
    // smooth scrolling is unreliable together with `scroll-snap-type` on
    // this track in Chromium browsers: the snap logic can cancel the
    // native animation before it moves at all, which read as the buttons
    // doing nothing. Driving scrollLeft directly every frame sidesteps that
    // — but scroll-snap-type has to be switched off for the *whole* animation
    // too, not just the native scrollTo case: it was still on here, so it
    // fought every single frame's manual scrollLeft assignment the same way
    // it fought the track-scrubber (see onTrackDown/onTrackUp above), which
    // is what made the buttons feel jerky and stall partway.
    if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxLeft = carousel.scrollWidth - carousel.clientWidth;
    const endLeft = Math.max(0, Math.min(left, maxLeft));
    if (reduced) {
      carousel.scrollLeft = endLeft;
      suppressFocusIndexRef.current = false;
      return;
    }
    // Deliberately left switched off once the animation lands, same as the
    // track-scrubber — each card here is `snap-center`, so re-enabling snap
    // right after landing on our flush-start target let the browser
    // immediately "correct" it toward the nearest card-center instead,
    // undoing the very position we just animated to. It's restored the
    // next time someone drags a card by hand (see onDown), which is where
    // the native settle-after-swipe behavior actually belongs.
    carousel.style.scrollSnapType = "none";
    const startLeft = carousel.scrollLeft;
    const delta = endLeft - startLeft;
    const duration = 420;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      carousel.scrollLeft = startLeft + delta * easeOutCubic(t);
      if (t < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
        // The "scroll" listener that drives updateFocus/updateProgress is
        // itself rAF-throttled (only one pending update at a time), so
        // while this animation was firing a "scroll" event on nearly every
        // frame, most of those got coalesced into whichever single
        // updateFocus call happened to be scheduled at that moment — which
        // could land on an in-between scrollLeft rather than this final
        // one. That's what made the highlighted card lag a click behind or
        // occasionally skip one. Dispatching one more "scroll" now the
        // animation has actually finished guarantees a fresh read of the
        // true resting position — lifting the suppression first so this
        // particular updateFocus call is allowed to (re)sync activeIndexRef.
        suppressFocusIndexRef.current = false;
        carousel.dispatchEvent(new Event("scroll"));
      }
    }
    scrollAnimRef.current = requestAnimationFrame(step);
  }

  return (
    <div>
      {/* The track's side padding (calc(50% - half a card)) is a
          percentage, and percentage padding always resolves against the
          *containing block's* width, never the padded element's own
          max-width — so max-w-[1180px] can't go directly on the padded,
          scrollable element itself. Putting it here on this plain outer
          wrapper instead makes the inner track's 50% resolve against an
          already-capped ≤1180px box; without this indirection, the track's
          own required padding (computed against the raw viewport) could
          exceed 1180px and force the box to grow past its own max-width
          just to fit that padding — exactly what was happening before. */}
      <div className="mx-auto max-w-[1180px]">
        <div
          ref={carouselRef}
          className={`relative flex cursor-grab snap-x snap-proximity gap-[22px] overflow-x-auto pb-5 pt-1.5 [-ms-overflow-style:none] [scrollbar-width:none] select-none [&::-webkit-scrollbar]:hidden ${paddingClassName}`}
        >
          {items.map((item, i) => (
            <article
              key={getKey(item)}
              ref={(el) => (cardRefs.current[i] = el)}
              className={`group relative flex flex-none snap-center items-end overflow-hidden rounded-2xl opacity-0 shadow-[0_14px_30px_-20px_rgba(11,42,74,0.35)] transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${cardClassName}`}
              style={{ transform: "translateY(24px) scale(0.9)" }}
            >
              {renderCard(item, i)}
            </article>
          ))}
        </div>

        {/* Sits flush under the cards (no gap, no pill) — a thin native-scrollbar-style
            track spanning the same 1180px width as the cards above, not the .wrap's own
            padding, so its ends line up exactly with the first/last card's edges. */}
        <div className="mt-1 flex items-center gap-2 px-1">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCard(-1)}
            className="flex h-5 w-5 flex-none items-center justify-center text-steel transition-colors duration-200 hover:text-blue"
          >
            <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
              <path d="M6 1 1 5l5 4V1z" fill="currentColor" />
            </svg>
          </button>

          {/* A real seek bar: click anywhere to jump there, or drag the
              handle to scrub, like an audio player's playback bar. The
              track itself has a taller invisible hit area (py-2, negative
              margin to cancel it visually) than the thin visible line, so
              it's easy to grab without needing pixel-perfect precision. */}
          <div ref={trackRef} className="group/track relative -my-2 flex-1 cursor-pointer touch-none py-2 select-none">
            <div className="relative h-1 overflow-hidden rounded-full bg-line">
              <div
                ref={fillRef}
                className="absolute inset-y-0 left-0 rounded-full bg-blue transition-[width] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              />
            </div>
            <div
              ref={handleRef}
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue shadow-[0_2px_6px_-1px_rgba(24,119,242,0.6)] ring-2 ring-white transition-[left] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover/track:scale-[1.15]"
            />
          </div>

          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCard(1)}
            className="flex h-5 w-5 flex-none items-center justify-center text-steel transition-colors duration-200 hover:text-blue"
          >
            <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
              <path d="M1 1v8l5-4-5-4z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <div className="wrap">
        {(hint || restartLabel) && (
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {hint && (
              <span className="inline-flex items-center gap-[7px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-blue">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="flex-none">
                  <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {hint}
              </span>
            )}
            {restartLabel && (
              <button
                type="button"
                onClick={() => goToIndex(0)}
                className="inline-flex cursor-pointer items-center gap-[7px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-steel transition-colors hover:text-blue"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-none">
                  <path
                    d="M9.5 3.2A4.2 4.2 0 1 0 10.2 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path d="M9.5 1v2.5H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {restartLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
