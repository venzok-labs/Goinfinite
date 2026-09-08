"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

// Same seven sectors as before, now carrying what the sticky story needs per
// step: a short sector tag, a distinct two-tone gradient (kept inside the
// existing brand palette — no new colors introduced), and a small line-icon.
// `image` is left undefined until real photography exists; swapping any one
// entry's `image` in later replaces just that step's gradient placeholder —
// see the fallback in the right-column render below.
const INDUSTRIES = [
  {
    key: "automotive",
    tag: "Automotive",
    name: "Automotive",
    copy: "Product Development turns ideas into practical designs. CAE Validation digitally tests those designs for safety and performance. Engineering Measurement validates the results using physical prototypes. Component Engineering finalizes materials and dimensions, while Manufacturing Support prepares the components and tooling for high-volume production.",
    icon: "car",
    gradient: "linear-gradient(135deg, #0b2a4a, #1d6fbf)",
    image: undefined,
  },
  {
    key: "aerospace",
    tag: "Aerospace",
    name: "Aerospace",
    copy: "Precision engineering, complex component development, measurement, and engineering analysis.",
    icon: "plane",
    gradient: "linear-gradient(135deg, #1d6fbf, #8fc9ff)",
    image: undefined,
  },
  {
    key: "heavy-engineering",
    tag: "Heavy Engineering",
    name: "Heavy Engineering",
    copy: "Industrial equipment, machinery, reverse engineering, manufacturing engineering, and engineering problem solving.",
    icon: "gear",
    gradient: "linear-gradient(135deg, #123a63, #0b2a4a)",
    image: undefined,
  },
  {
    key: "shipbuilding",
    tag: "Shipbuilding",
    name: "Shipbuilding",
    copy: "Mechanical components, engineering measurement, product development, and manufacturing support.",
    icon: "ship",
    gradient: "linear-gradient(135deg, #076bdd, #0b2a4a)",
    image: undefined,
  },
  {
    key: "defence",
    tag: "Defence",
    name: "Defence",
    copy: "Engineering design support, product development, measurement, and validation‑related engineering services.",
    icon: "shield",
    gradient: "linear-gradient(135deg, #0b2a4a, #0e5aa0)",
    image: undefined,
  },
  {
    key: "industrial-equipment",
    tag: "Industrial Equipment & Machinery",
    name: "Industrial Equipment & Machinery",
    copy: "Custom engineering, machine development, reverse engineering, and product improvement.",
    icon: "factory",
    gradient: "linear-gradient(135deg, #0e5aa0, #123a63)",
    image: undefined,
  },
  {
    key: "energy",
    tag: "Energy & Process Industries",
    name: "Energy & Process Industries",
    copy: "Engineering services for industrial equipment, machinery, and plant‑related components.",
    icon: "bolt",
    gradient: "linear-gradient(135deg, #0b2a4a, #076bdd)",
    image: undefined,
  },
];

const ICON_PATHS = {
  car: "M4 16.5 5 11c.3-1 1.2-1.7 2.3-1.7h9.4c1.1 0 2 .7 2.3 1.7l1 5.5M4 16.5v2c0 .6.4 1 1 1h1.2c.6 0 1-.4 1-1v-1M4 16.5h16M19 16.5v2c0 .6-.4 1-1 1h-1.2c-.6 0-1-.4-1-1v-1M7.5 13.2h9M7.3 16.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm9.4 0a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z",
  plane: "M11 3.5 8.7 9.2 3 11l2 1.4-.6 2.3 2.4-.9 1.2 1.9 1.6-4.9 5.7 5.9 1-1-5-6.8 4.6-2.3-1-1.4-5 1.6L14.1 3l-1-.5-2.1 1Z",
  gear: "M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0-4.9 1 2.1 2.2-.6 1.2 2 2.2.4-.1 2.3 1.9 1.3-1.2 2 .8 2.1-2.2.7-.2 2.3-2.2-.1-1.1 2-2-.9-2 .9-1.1-2-2.2.1-.2-2.3-2.2-.7.8-2.1-1.2-2 1.9-1.3-.1-2.3 2.2-.4 1.2-2 2.2.6 1-2.1Z",
  ship: "M5 14.5h14l-1.6 4.4a2 2 0 0 1-1.9 1.3H8.5a2 2 0 0 1-1.9-1.3L5 14.5Zm4-2v-6h2v-2h2v2h2v6M7 14.5V11h10v3.5M12 3v2",
  shield: "M12 3.2 5 5.8v5.4c0 4.5 2.9 8 7 9.6 4.1-1.6 7-5.1 7-9.6V5.8L12 3.2Zm-2.6 8.4 1.9 1.9 3.4-4",
  factory: "M4 20V9l4.5 3V9l4.5 3V9l4.5 3v8H4Zm3-1v-3m4 3v-3m4 3v-3M8 6l1.2-2M12 6l1.2-2M16 6l1.2-2",
  bolt: "M13 3 5 13.5h5.2L10 21l8-11h-5.4L13 3Z",
};

function IndustryIcon({ icon, className }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className} aria-hidden="true">
      <path
        d={ICON_PATHS[icon]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const COUNT = INDUSTRIES.length;

// One step per wheel gesture, not per pixel — while mid-transition, further
// wheel ticks are swallowed so a single flick can't skip more than one card.
const STEP_COOLDOWN_MS = 420;

/*
 * Desktop: a fixed one-viewport-tall panel. Panel transitions only happen
 * when the wheel event fires directly over the card stage (the `stageRef`
 * element) — page scroll everywhere else, including the rest of this same
 * section, is completely untouched. While stepping between cards 1..7 the
 * wheel event's default action is prevented so the page itself doesn't move;
 * once at the first or last card, scrolling further in that direction is
 * simply let through (no preventDefault), so the page scrolls past the
 * panel normally in either direction — it never gets "stuck."
 *
 * This intentionally replaces an earlier tall-spacer + `position: sticky` +
 * scroll-progress version: that approach mapped a large pixel distance to
 * each card change, which read as sluggish. There's no internal scrollable
 * element here (no overflow:scroll container), so there's nothing that
 * could show its own scrollbar.
 *
 * Mobile (≤900px): unaffected — still a plain vertical list, no wheel
 * handling at all. Both versions are always in the DOM (toggled with CSS,
 * not JS) so there's no hydration mismatch or layout flash on load.
 */
export default function Industries() {
  const stageRef = useRef(null);
  const activeRef = useRef(0);
  const lockedRef = useRef(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function onWheel(e) {
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (dir === 0) return;

      const atEnd = activeRef.current === COUNT - 1 && dir === 1;
      const atStart = activeRef.current === 0 && dir === -1;
      if (atEnd || atStart) {
        // Boundary reached in this direction — let the page scroll past
        // the panel normally instead of intercepting.
        return;
      }

      e.preventDefault();
      if (lockedRef.current) return;

      lockedRef.current = true;
      const next = activeRef.current + dir;
      activeRef.current = next;
      setActive(next);
      setTimeout(() => {
        lockedRef.current = false;
      }, STEP_COOLDOWN_MS);
    }

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section id="industries">
      {/* Mobile-only intro — on desktop this same copy lives inside the
          pinned panel's static left column instead (see below), since that
          column never moves while the cards behind it change. */}
      <div className="wrap hidden max-[900px]:block">
        <Reveal className="sec-head">
          <div className="eyebrow">Industries we serve</div>
          <h2 className="text-[32px]">Engineering Experience Across Industries</h2>
          <p className="max-w-[60ch] text-base">
            Our industry experience shows we understand different engineering environments — not
            just different logos.
          </p>
        </Reveal>
      </div>

      {/* ---------- Desktop: fixed-height panel, wheel-driven story ---------- */}
      <div className="relative hidden h-screen min-[901px]:flex flex-col justify-center overflow-hidden bg-[#0c1826]">
        {/* Faint background texture — the panel is much taller than the
            content it holds, so this keeps the surrounding dark space from
            reading as empty rather than deliberate. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[repeating-linear-gradient(45deg,#ffffff_0px,#ffffff_1px,transparent_1px,transparent_28px)]"
        />

        <div className="wrap grid grid-cols-[36%_64%] items-center gap-14 max-[1100px]:gap-10">
            {/* LEFT — static text plus a full jump-to-any-industry list, so
                the column doesn't run out of content halfway down. Clicking
                a row jumps straight to it (independent of the wheel stepper
                on the stage). */}
            <div>
              <div className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#6fe3c9]">
                Industries we serve
              </div>
              <h2 className="mt-3.5 text-[clamp(26px,2.2vw+14px,36px)] leading-[1.15] text-white">
                Engineering Experience Across Industries
              </h2>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-[1.65] text-[#a9bbd0]">
                Our industry experience shows we understand different engineering environments —
                not just different logos.
              </p>

              <ul className="mt-9 flex flex-col border-t border-white/10">
                {INDUSTRIES.map((ind, i) => (
                  <li key={ind.key} className="border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        activeRef.current = i;
                        setActive(i);
                      }}
                      className="group flex w-full items-center gap-4 py-3 text-left"
                    >
                      <span
                        className={`font-mono text-[11px] tabular-nums transition-colors duration-300 ${
                          i === active ? "text-[#6fb3ff]" : "text-[#4d6178]"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[14.5px] transition-colors duration-300 ${
                          i === active
                            ? "font-semibold text-white"
                            : "text-[#7a93ad] group-hover:text-[#c3d3e3]"
                        }`}
                      >
                        {ind.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {INDUSTRIES.map((ind, i) => (
                    <span
                      key={ind.key}
                      className={`h-1.5 rounded-full transition-all duration-500 motion-reduce:transition-none ${
                        i === active ? "w-6 bg-[#6fb3ff]" : "w-1.5 bg-white/15"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs tracking-[0.08em] text-[#7a93ad]">
                  {String(active + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* RIGHT — one portrait card at a time, enlarged to dominate the
                stage rather than float in empty space (no photography yet).
                Upcoming cards peek behind it in a diagonal cascade, scaled
                down; the previous card drops away. */}
            <div
              ref={stageRef}
              className="relative flex h-[min(82vh,720px)] w-full items-center justify-center"
            >
              {INDUSTRIES.map((ind, i) => {
                const d = i - active;
                let transform = "translate(0,0) scale(1)";
                let opacity = 1;
                let z = 10;
                if (d === 1) {
                  transform = "translate(58px,-48px) scale(.87)";
                  opacity = 0.7;
                  z = 9;
                } else if (d === 2) {
                  transform = "translate(106px,-88px) scale(.76)";
                  opacity = 0.4;
                  z = 8;
                } else if (d === 3) {
                  transform = "translate(148px,-122px) scale(.66)";
                  opacity = 0.18;
                  z = 7;
                } else if (d === -1) {
                  transform = "translate(-42px,40px) scale(.94)";
                  opacity = 0;
                  z = 5;
                } else if (d !== 0) {
                  transform = `translate(${d > 0 ? 188 : -74}px, ${d > 0 ? -160 : 60}px) scale(.55)`;
                  opacity = 0;
                  z = 1;
                }
                return (
                  <div
                    key={ind.key}
                    aria-hidden={i !== active}
                    className="absolute h-full w-[min(94%,540px)] overflow-hidden rounded-[24px] shadow-[0_32px_70px_-24px_rgba(0,0,0,0.55)] transition-[transform,opacity] duration-[380ms] ease-out motion-reduce:transition-none motion-reduce:duration-0"
                    style={{ transform, opacity, zIndex: z, background: ind.gradient }}
                  >
                    <div className="absolute inset-0 bg-black/28" />
                    {/* No photography behind this card, so the text sits
                        centered in the card itself rather than anchored to
                        the bottom like a photo caption. */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-9 text-center">
                      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm">
                        <IndustryIcon icon={ind.icon} />
                      </span>
                      <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8fd6c4]">
                        {String(i + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
                      </span>
                      <h3 className="text-[25px] font-semibold text-white">{ind.name}</h3>
                      <p className="mt-3 max-w-[38ch] text-[14.5px] leading-[1.6] text-white/85">{ind.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {/* ---------- Mobile/tablet fallback: plain vertical list ---------- */}
      <div className="wrap hidden max-[900px]:block">
        <div className="flex flex-col gap-10">
          {INDUSTRIES.map((ind, i) => (
            <Reveal key={ind.key} as="article" className="flex flex-col gap-4">
              <div
                className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-line max-[560px]:h-[180px]"
                style={
                  ind.image
                    ? { backgroundImage: `url(${ind.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: ind.gradient }
                }
                role="img"
                aria-label={`${ind.name} — illustration`}
              >
                <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm">
                  <IndustryIcon icon={ind.icon} />
                </span>
              </div>
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-blue">
                  Sector {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-2xl text-navy">{ind.name}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-steel">{ind.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
