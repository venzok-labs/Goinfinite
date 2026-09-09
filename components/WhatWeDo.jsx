"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Reveal from "./Reveal";

// Each step can carry a real photo (`image`); until one is supplied it falls
// back to a plain brand-blue gradient card instead of placeholder artwork.
const STEPS = [
  {
    no: "01",
    title: "Concept & Design",
    copy: "Ideas, sketches and requirements into practical CAD.",
    image: "/images/what-we-do/concept-design.webp",
  },
  {
    no: "02",
    title: "CAE Validation",
    copy: "Simulation‑led decisions before manufacturing.",
    image: "/images/what-we-do/cae-validation.webp",
  },
  {
    no: "03",
    title: "Measurement",
    copy: "3D measurement, scanning & reverse engineering.",
    image: "/images/what-we-do/measurement.webp",
  },
  {
    no: "04",
    title: "Manufacturing",
    copy: "Design reviews, tooling, production support.",
    image: "/images/what-we-do/manufacturing.webp",
  },
  { no: "05", title: "Testing", copy: "Verification of performance and reliability." },
  { no: "06", title: "SPM Development", copy: "Custom mechanical, electrical & PLC machines." },
];

const COUNT = STEPS.length;

/*
 * A drag-to-swipe card carousel rather than a static grid — cards snap into
 * place one at a time, dragged with a mouse or swiped on touch (native
 * overflow-x scrolling handles touch for free). Three animation layers,
 * matching the approved mockup:
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
 */
export default function WhatWeDo() {
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const dotRefs = useRef([]);
  // Always the live, geometry-derived "which card is centered right now" —
  // recomputed on every scroll tick, so it self-corrects continuously
  // rather than trying to track an intended destination. An earlier version
  // pinned this to a button's target until geometry matched it exactly,
  // which could get permanently stuck (and the affected card visibly stuck
  // mid-opacity-transition) whenever that match was never quite exact.
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = cardRefs.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // offsetLeft is pure layout position, unaffected by the CSS `transform:
    // scale(...)` the focus effect applies — getBoundingClientRect() would
    // read slightly short here whenever a neighboring card is mid-scale-down.
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

      // Cards snap centered (`scroll-snap-align: center`) within this full
      // page-width carousel, so the browser's actual snap position for card
      // i is wherever *centers* it in the viewport — not a simple
      // `i * step` offset (that assumption caused targets computed by hand
      // to fight the browser's own snap correction). Geometry — distance
      // from each card's center to the frame's center — reads the true
      // snapped card directly, with boundary clamping for the first/last
      // card since the scroll range can't go negative or past the end to
      // fully center those two.
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
      if (atEnd) nearestIdx = COUNT - 1;

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
  }, []);

  function scrollByCard(dir) {
    const carousel = carouselRef.current;
    const cards = cardRefs.current;
    const current = activeIndexRef.current;
    const target = dir === 1 ? (current === COUNT - 1 ? 0 : current + 1) : current === 0 ? COUNT - 1 : current - 1;
    // Advance the ref immediately rather than only via the scroll-driven
    // updateFocus() — that keeps each click's target correct even if a
    // 'scroll' event is ever slow or skipped, without re-introducing the
    // earlier "pin until exact match" bug (nothing here blocks updateFocus
    // from correcting activeIndexRef the moment real geometry disagrees).
    activeIndexRef.current = target;

    const targetCard = cards[target];
    if (!carousel || !targetCard) return;
    // Center the target card by direct computation, not scrollIntoView —
    // cards snap centered (`scroll-snap-align: center`) in a viewport much
    // wider than one card, and computing that offset by hand as `i * step`
    // fought the browser's own snap correction; this instead measures the
    // card's own real layout position, the same value scrollIntoView would
    // use internally, without depending on its ancestor-walking behavior.
    const left = targetCard.offsetLeft + targetCard.offsetWidth / 2 - carousel.clientWidth / 2;
    carousel.scrollTo({ left, behavior: "smooth" });
  }

  return (
    <section id="what-we-do">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow text-[15px]">What we do</div>
          <h2 className="text-[38px]">One Engineering Partner. Multiple Capabilities.</h2>
          <p className="max-w-[62ch] text-[17px]">
            A successful product must be designed correctly, validated under real operating
            conditions, measured accurately, manufactured reliably, and tested before it reaches
            the customer — we bring all of it together under one roof.
          </p>
        </Reveal>
      </div>

      {/* Side padding equals half the viewport minus half a card, not a
          fixed inset — that's what lets every card, including the first and
          last, actually reach a fully-centered scroll position. With only a
          token inset, the last couple of cards can never scroll far enough
          to center (the browser clamps at the max scrollable position),
          so several different "centered" targets near the end collapsed
          onto the same clamped position and became indistinguishable. */}
      <div
        ref={carouselRef}
        className="flex cursor-grab snap-x snap-proximity gap-[22px] overflow-x-auto px-[calc(50%-170px)] pb-5 pt-1.5 [-ms-overflow-style:none] [scrollbar-width:none] select-none [&::-webkit-scrollbar]:hidden max-[560px]:px-[calc(50%-43vw)]"
      >
        {STEPS.map((s, i) => {
          const isLast = s.no === "06";
          return (
            <article
              key={s.no}
              ref={(el) => (cardRefs.current[i] = el)}
              className="group relative flex h-[300px] w-[340px] flex-none snap-center items-end overflow-hidden rounded-2xl opacity-0 shadow-[0_14px_30px_-20px_rgba(11,42,74,0.35)] transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-[560px]:w-[86vw]"
              style={{ transform: "translateY(24px) scale(0.9)" }}
            >
              <div
                className="absolute inset-0 scale-[1.02] bg-panel-1 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
                style={
                  s.image
                    ? { backgroundImage: `url(${s.image})` }
                    : { background: "linear-gradient(145deg, var(--panel-1), var(--panel-3))" }
                }
                role="img"
                aria-label={`${s.title} — illustration`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,20,38,0)_34%,rgba(6,20,38,0.88)_100%)]" />
              <div className="relative z-[2] p-[26px_24px] text-white">
                <span className="font-mono text-xs tracking-[0.06em] text-[#8fc9ff]">{s.no}</span>
                <h4 className="mt-2 text-xl text-white">{s.title}</h4>
                <p className="mt-2 text-sm leading-normal text-white/86">{s.copy}</p>
                {isLast && (
                  <Link
                    href="/services"
                    className="relative mt-3.5 inline-flex items-center gap-2 rounded-full border-[1.5px] border-white/65 px-[18px] py-[9px] font-body text-[13px] font-semibold text-white transition-[background,border-color,transform] duration-200 hover:-translate-y-px hover:border-white hover:bg-white/16"
                  >
                    See How It Works →
                  </Link>
                )}
              </div>
              <Link
                href={`/services#service-${s.no}`}
                className={`absolute inset-0 z-[3] ${isLast ? "bottom-[54px]" : ""} focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-[3px] focus-visible:outline-white`}
                aria-label={`${s.title} — see this service on the Services page`}
              />
            </article>
          );
        })}
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
          {STEPS.map((s, i) => (
            <span
              key={s.no}
              ref={(el) => (dotRefs.current[i] = el)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? "w-5 bg-blue" : "w-1.5 bg-line"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
