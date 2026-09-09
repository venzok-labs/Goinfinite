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
}) {
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const thumbRef = useRef(null);
  const activeIndexRef = useRef(0);
  const scrollAnimRef = useRef(null);
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

      const frameRect = carousel.getBoundingClientRect();
      const center = frameRect.left + frameRect.width / 2;
      const atStart = carousel.scrollLeft <= 1;
      const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;

      let nearestIdx = 0;
      let nearestDist = Infinity;
      const distances = cards.map((card, i) => {
        if (!card) return Infinity;
        const r = card.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - center);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
        return dist;
      });
      if (atStart) nearestIdx = 0;
      if (atEnd) nearestIdx = count - 1;

      cards.forEach((card, i) => {
        if (!card) return;
        const norm = Math.min(1, distances[i] / step);
        if (!reduced) {
          card.style.transform = `translateY(0) scale(${(1 - norm * 0.14).toFixed(3)})`;
          card.style.opacity = (1 - norm * 0.55).toFixed(3);
        }
      });

      cards.forEach((card, i) => card?.classList.toggle("shadow-[0_26px_54px_-18px_rgba(11,42,74,0.5)]", i === nearestIdx));
      activeIndexRef.current = nearestIdx;
      updateThumb();
    }
    function updateThumb() {
      const thumb = thumbRef.current;
      if (!thumb) return;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const progress = maxScroll > 0 ? carousel.scrollLeft / maxScroll : 0;
      // Thumb width mirrors how much of the whole track one screenful
      // covers, same idea as a native scrollbar — floored so it stays
      // grabbable even when there are many cards.
      const widthPct = Math.max(18, (carousel.clientWidth / carousel.scrollWidth) * 100);
      thumb.style.width = `${widthPct}%`;
      thumb.style.left = `${progress * (100 - widthPct)}%`;
    }
    function requestFocusUpdate() {
      if (focusRaf) return;
      focusRaf = requestAnimationFrame(updateFocus);
    }
    carousel.addEventListener("scroll", requestFocusUpdate, { passive: true });
    window.addEventListener("resize", requestFocusUpdate);
    updateThumb();

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
      if (Math.abs(delta) > 4) dragged = true;
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
      entranceIo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  function scrollByCard(dir) {
    const carousel = carouselRef.current;
    const cards = cardRefs.current;
    const current = activeIndexRef.current;
    const target = dir === 1 ? (current === count - 1 ? 0 : current + 1) : current === 0 ? count - 1 : current - 1;
    activeIndexRef.current = target;

    const targetCard = cards[target];
    if (!carousel || !targetCard) return;
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
    // doing nothing. Driving scrollLeft directly every frame sidesteps that.
    if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxLeft = carousel.scrollWidth - carousel.clientWidth;
    const endLeft = Math.max(0, Math.min(left, maxLeft));
    if (reduced) {
      carousel.scrollLeft = endLeft;
      return;
    }
    const startLeft = carousel.scrollLeft;
    const delta = endLeft - startLeft;
    const duration = 420;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      carousel.scrollLeft = startLeft + delta * easeOutCubic(t);
      scrollAnimRef.current = t < 1 ? requestAnimationFrame(step) : null;
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
          className={`flex cursor-grab snap-x snap-proximity gap-[22px] overflow-x-auto pb-5 pt-1.5 [-ms-overflow-style:none] [scrollbar-width:none] select-none [&::-webkit-scrollbar]:hidden ${paddingClassName}`}
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

          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
            <div ref={thumbRef} className="absolute inset-y-0 rounded-full bg-blue transition-[left,width] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]" />
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
        {hint && (
          <div className="mt-3.5 flex justify-center">
            <span className="inline-flex items-center gap-[7px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-blue">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="flex-none">
                <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {hint}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
