"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

// Career/company timeline, 1980 -> 2026. Only two dates are confirmed by the
// brief: career start in the "1980s" and Infinite Solutions founded in 2017.
// The years in between (1985/1991/1996/2001/2006/2012) are spaced-out
// placeholders for the known career stages (Steel Plant, CAD/CAE adoption,
// multi-industry work, FARO, Pennar) — not confirmed dates. Check the real
// years with Raman before treating these as historical fact.
const STOPS = [
  {
    year: 1980,
    title: "Early Engineering Career",
    desc: "Sketching & Measurement Engineer at Visakhapatnam Steel Plant, through Best & Crompton.",
  },
  {
    year: 1985,
    title: "Industrial Engineering Experience",
    desc: "Reverse engineering and dimensional measurement on major industrial equipment.",
  },
  {
    year: 1991,
    title: "CAD & Engineering Analysis",
    desc: "AutoCAD, Creo, SolidWorks adopted, followed by FEA and CFD techniques.",
  },
  {
    year: 1996,
    title: "Advanced Engineering Projects",
    desc: "Work spans automotive, aerospace, heavy engineering, and shipbuilding.",
  },
  {
    year: 2001,
    title: "FARO Business Technologies",
    desc: "Association with FARO begins — advanced 3D measurement and metrology.",
  },
  {
    year: 2006,
    title: "International Technical Training",
    desc: "Specialised FARO equipment training in the United States and Singapore.",
  },
  {
    year: 2012,
    title: "Pennar Industries — General Manager",
    desc: "Leads a team of approximately 100 engineers across major programmes.",
  },
  {
    year: 2017,
    title: "Infinite Solutions Founded",
    desc: "Raman Baskaran founds Infinite Solutions to bring these capabilities together.",
    milestone: true,
  },
  {
    year: 2020,
    title: "Engineering Services Established",
    desc: "Integrated design, CAE, measurement, and manufacturing services running.",
  },
  {
    year: 2023,
    title: "Multi-Industry Client Base",
    desc: "Engagements spanning automotive, heavy engineering, defence, and more.",
  },
  {
    year: 2026,
    title: "Today — Running Successfully",
    desc: "Infinite Solutions operating across the full engineering lifecycle.",
    success: true,
  },
];

const COUNT = STOPS.length;
const MIN_YEAR = STOPS[0].year;
const SPAN = STOPS[COUNT - 1].year - MIN_YEAR;

function pct(year) {
  return ((year - MIN_YEAR) / SPAN) * 100;
}

export default function AboutTimeline() {
  const sectionRef = useRef(null);
  // Each play() run stamps a unique token here; a run checks its own token
  // is still current before every state update, so starting a replay mid-
  // playback cleanly abandons the old run instead of both racing.
  const cancelRef = useRef(null);
  const everPlayedRef = useRef(false);
  const playRef = useRef(null); // holds the latest play() so the Replay button can call it
  const [reached, setReached] = useState(0); // count of stops reached so far (0..COUNT)
  const [activeIndex, setActiveIndex] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Starting automatically…");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, reduced ? Math.min(ms, 150) : ms));
    }

    async function play() {
      const token = (cancelRef.current = Symbol());
      setPlaying(true);
      setReached(0);
      setActiveIndex(null);
      setStatus(`Playing… ${STOPS[0].year}`);

      for (let i = 0; i < COUNT; i++) {
        if (cancelRef.current !== token) return; // superseded by a replay
        setReached(i + 1);
        setActiveIndex(i);
        setStatus(i === COUNT - 1 ? `Complete — ${STOPS[i].year}` : `Playing… ${STOPS[i].year}`);
        await sleep(700);
        if (cancelRef.current !== token) return;
        await sleep(STOPS[i].milestone ? 1600 : STOPS[i].success ? 2000 : 1000);
      }
      if (cancelRef.current === token) {
        setPlaying(false);
        setStatus("Complete — 2026, running successfully");
      }
    }

    playRef.current = play;

    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !everPlayedRef.current) {
            everPlayedRef.current = true;
            play();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelRef.current = null; // invalidate any in-flight loop on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleReplay() {
    // play() stamps its own fresh token, which already invalidates whatever
    // run (if any) is still in flight — nothing else to clear here.
    playRef.current?.();
  }

  const active = activeIndex !== null ? STOPS[activeIndex] : STOPS[0];
  const fillPct = activeIndex !== null ? pct(STOPS[activeIndex].year) : 0;

  return (
    <section id="about" ref={sectionRef}>
      <div className="wrap">
        <Reveal className="sec-head mx-auto text-center">
          <div className="eyebrow">About Infinite Solutions</div>
          <h2 className="text-[32px]">25+ Years of Engineering Experience, Distilled Into One Company</h2>
          <p className="mx-auto max-w-[60ch]">
            From an early career in industrial measurement to founding Infinite Solutions in 2017 — a
            timeline of where this experience came from.
          </p>
        </Reveal>

        <div className="mb-9 flex items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={handleReplay}
            disabled={playing}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4.5 py-2 font-body text-[13.5px] font-semibold text-navy transition-colors hover:border-blue hover:text-blue disabled:cursor-default disabled:opacity-50 disabled:hover:border-line disabled:hover:text-navy"
          >
            ↺ Replay timeline
          </button>
          <span className="font-mono text-[11.5px] text-steel">{status}</span>
        </div>

        {/* track */}
        <div className="relative px-2.5 pt-5">
          <div className="relative mx-1.5 h-[3px] rounded-full bg-line">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-blue transition-[width] duration-700 ease-[cubic-bezier(0.3,0.7,0.2,1)]"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="relative h-0">
            {STOPS.map((s, i) => {
              const isReached = i < reached;
              const isActive = i === activeIndex;
              const size = s.milestone ? 22 : 18;
              let borderColor = "var(--line)";
              let dotColor = "var(--line)";
              let ring = "none";
              if (isReached) {
                if (s.success) {
                  borderColor = "#0f8a7a";
                  dotColor = "#0f8a7a";
                } else if (s.milestone) {
                  borderColor = "var(--navy)";
                  dotColor = "var(--navy)";
                } else {
                  borderColor = "var(--blue)";
                  dotColor = "var(--blue)";
                }
              }
              if (isActive) {
                ring = s.success ? "0 0 0 5px #e7f6f3" : "0 0 0 5px rgba(29,111,191,0.15)";
              }
              return (
                <div
                  key={s.year}
                  className="absolute flex items-center justify-center rounded-full bg-white transition-[border-color,transform,box-shadow] duration-300"
                  style={{
                    left: `${pct(s.year)}%`,
                    top: -(size / 2) - (s.milestone ? 2 : 0),
                    width: size,
                    height: size,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor,
                    transform: `translateX(-50%) scale(${isActive ? 1.3 : 1})`,
                    boxShadow: ring,
                  }}
                >
                  <span
                    className="rounded-full transition-colors duration-300"
                    style={{
                      width: s.milestone && isReached ? 8 : 6,
                      height: s.milestone && isReached ? 8 : 6,
                      background: dotColor,
                    }}
                  />
                </div>
              );
            })}

            {/* tooltip */}
            <div
              className="pointer-events-none absolute -top-[44px] z-[5] whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[11px] text-white transition-[left,opacity,transform,background] duration-300"
              style={{
                left: `${fillPct}%`,
                transform: `translateX(-50%) translateY(${activeIndex !== null ? 0 : 6}px)`,
                opacity: activeIndex !== null ? 1 : 0,
                background: active.success ? "#0f8a7a" : active.milestone ? "var(--blue)" : "var(--navy)",
              }}
            >
              {active.year} — {active.title}
              <span
                className="absolute left-1/2 -bottom-[5px] h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent"
                style={{
                  borderTopColor: active.success ? "#0f8a7a" : active.milestone ? "var(--blue)" : "var(--navy)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-between font-mono text-[10.5px] text-steel">
          {STOPS.map((s, i) => (
            <span key={s.year} className={i !== 0 && i !== COUNT - 1 && i % 2 === 1 ? "opacity-0 max-[760px]:hidden" : ""}>
              {s.year}
            </span>
          ))}
        </div>

        {/* detail card */}
        <div
          className="mx-auto mt-10 max-w-[640px] rounded-xl border border-line p-6 transition-[border-color,background] duration-300 sm:p-7"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: active.success ? "#0f8a7a" : active.milestone ? "var(--navy)" : "var(--blue)",
            background: `linear-gradient(90deg, ${
              active.success ? "#e7f6f3" : active.milestone ? "#e7edf3" : "var(--tint)"
            }, var(--white) 160px)`,
          }}
        >
          <span
            className="font-mono text-[13px] font-semibold"
            style={{ color: active.success ? "#0f8a7a" : active.milestone ? "var(--navy)" : "var(--blue)" }}
          >
            {active.year}
          </span>
          <h3 className="mt-1.5 font-display text-[19px] font-semibold text-navy">{active.title}</h3>
          <p className="mt-2 max-w-[60ch] text-sm text-steel">
            {activeIndex === null
              ? "The timeline plays automatically — watch the marker travel the track above."
              : active.desc}
          </p>
          {active.success && activeIndex !== null && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e7f6f3] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.05em] text-[#0f8a7a]">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M4 12l6 6L20 6" />
              </svg>
              Running successfully
            </div>
          )}
          {active.milestone && activeIndex !== null && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e7edf3] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.05em] text-navy">
              Founded
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
