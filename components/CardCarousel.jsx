"use client";

import { useEffect, useRef } from "react";

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
 * `paddingClassName` must give the track side padding equal to
 * `calc(50% - half the card's rendered width)` at every breakpoint the card
 * itself changes width at (matching `cardClassName`'s own width/breakpoint
 * pair) — that's what gives every card, including the first and last,
 * genuine room to reach a fully centered scroll position. Without it, the
 * last couple of cards can never scroll far enough to center and the
 * browser clamps several different targets onto the same position, which
 * reads as the carousel stalling or jumping. It's a caller-supplied literal
 * class string rather than computed from a numeric prop because Tailwind
 * only generates arbitrary-value classes it can find as literal text in
 * source — a runtime-interpolated `px-[calc(...)]` string never matches.
 */
export default function CardCarousel({
  items,
  getKey,
  renderCard,
  hint,
  cardClassName = "h-[300px] w-[340px] max-[560px]:w-[86vw]",
  paddingClassName = "px-[calc(50%-170px)] max-[560px]:px-[calc(50%-43vw)]",
}) {
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const dotRefs = useRef([]);
  const activeIndexRef = useRef(0);
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
      dotRefs.current.forEach((d, i) => d?.classList.toggle("w-5", i === nearestIdx));
      dotRefs.current.forEach((d, i) => d?.classList.toggle("bg-blue", i === nearestIdx));
      dotRefs.current.forEach((d, i) => d?.classList.toggle("bg-line", i !== nearestIdx));
      activeIndexRef.current = nearestIdx;
    }
    function requestFocusUpdate() {
      if (focusRaf) return;
      focusRaf = requestAnimationFrame(updateFocus);
    }
    carousel.addEventListener("scroll", requestFocusUpdate, { passive: true });
    window.addEventListener("resize", requestFocusUpdate);

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
    let startX = 0;
    let startScroll = 0;
    function onDown(e) {
      isDown = true;
      carousel.classList.add("cursor-grabbing");
      startX = e.pageX;
      startScroll = carousel.scrollLeft;
    }
    function onUp() {
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove("cursor-grabbing");
      requestFocusUpdate();
    }
    function onMove(e) {
      if (!isDown) return;
      carousel.scrollLeft = startScroll - (e.pageX - startX);
    }
    carousel.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);

    return () => {
      if (focusRaf) cancelAnimationFrame(focusRaf);
      carousel.removeEventListener("scroll", requestFocusUpdate);
      window.removeEventListener("resize", requestFocusUpdate);
      carousel.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
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
    // Center the target card by direct computation, not scrollIntoView —
    // cards snap centered (`scroll-snap-align: center`) in a viewport much
    // wider than one card, so this measures the card's own real layout
    // position rather than assuming a uniform `index * step` offset.
    const left = targetCard.offsetLeft + targetCard.offsetWidth / 2 - carousel.clientWidth / 2;
    carousel.scrollTo({ left, behavior: "smooth" });
  }

  return (
    <div>
      {/* Side padding equals half the viewport minus half a card, not a
          fixed inset — that's what lets every card, including the first and
          last, actually reach a fully-centered scroll position. */}
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

      <div className="wrap">
        <div className="mt-6 flex items-center justify-center gap-3.5">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCard(-1)}
            className="group/btn flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-navy transition-[border-color,color,transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.06] hover:border-blue hover:text-blue hover:shadow-[0_10px_22px_-12px_rgba(29,111,191,0.45)] active:translate-y-0 active:scale-[0.94] active:shadow-none"
          >
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              className="transition-transform duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:-translate-x-0.5 group-hover/btn:scale-110"
            >
              <path d="M15 6H1M6 1 1 6l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCard(1)}
            className="group/btn flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-navy transition-[border-color,color,transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.06] hover:border-blue hover:text-blue hover:shadow-[0_10px_22px_-12px_rgba(29,111,191,0.45)] active:translate-y-0 active:scale-[0.94] active:shadow-none"
          >
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              className="transition-transform duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:translate-x-0.5 group-hover/btn:scale-110"
            >
              <path d="M1 6h14M10 1l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
          {items.map((item, i) => (
            <span
              key={getKey(item)}
              ref={(el) => (dotRefs.current[i] = el)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? "w-5 bg-blue" : "w-1.5 bg-line"}`}
            />
          ))}
        </div>

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
