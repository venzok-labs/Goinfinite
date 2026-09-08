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
    copy: "Product development, engineering measurement, CAE validation, manufacturing support, and component engineering.",
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

/*
 * Desktop: a single sticky two-column composition — the section is a tall
 * (COUNT * 100vh) spacer with the actual content pinned via `position:
 * sticky` inside it. Which industry is "active" is driven purely by scroll
 * position (no clicking required): a single passive scroll listener, batched
 * to one read/write per animation frame and only touching React state when
 * the active index actually changes — never on every pixel of scroll — plus
 * an IntersectionObserver that adds/removes that listener so it's only alive
 * while this section is anywhere near the viewport.
 *
 * Mobile (≤900px): the sticky/scroll-linked version is skipped entirely —
 * this renders as a plain vertical list instead, each industry with its own
 * image/title/copy, one after another. Both versions are always in the DOM
 * (toggled with CSS, not JS) so there's no client/server hydration mismatch
 * and no layout flash on load.
 */
export default function Industries() {
  const wrapperRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const desktopMq = window.matchMedia("(min-width: 901px)");
    let listening = false;
    let ticking = false;
    let inView = false;

    function computeActive() {
      ticking = false;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const next = Math.min(COUNT - 1, Math.floor(progress * COUNT));
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(computeActive);
    }

    function startListening() {
      if (listening || !desktopMq.matches) return;
      listening = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      computeActive();
    }
    function stopListening() {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", onScroll);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (inView) startListening();
          else stopListening();
        });
      },
      { rootMargin: "200px 0px 200px 0px" }
    );
    io.observe(wrapper);

    function onMqChange() {
      if (!desktopMq.matches) {
        stopListening();
        activeRef.current = 0;
        setActive(0);
      } else if (inView) {
        startListening();
      }
    }
    desktopMq.addEventListener("change", onMqChange);

    return () => {
      io.disconnect();
      stopListening();
      desktopMq.removeEventListener("change", onMqChange);
    };
  }, []);

  return (
    <section id="industries">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow">Industries we serve</div>
          <h2 className="text-[32px]">Engineering Experience Across Industries</h2>
          <p className="max-w-[60ch] text-base">
            Different engineering environments call for different judgement — our experience
            spans the following sectors.
          </p>
        </Reveal>
      </div>

      {/* ---------- Desktop: sticky scroll-driven story ---------- */}
      <div
        ref={wrapperRef}
        style={{ height: `${COUNT * 100}vh` }}
        className="relative hidden min-[901px]:block"
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="wrap grid grid-cols-[42%_58%] items-center gap-16 max-[1100px]:gap-10">
            {/* LEFT — text stack: all steps occupy the same grid cell so the
                column auto-sizes to the tallest one and swapping the active
                step never shifts the layout. */}
            <div>
              <div className="grid">
                {INDUSTRIES.map((ind, i) => (
                  <div
                    key={ind.key}
                    aria-hidden={i !== active}
                    className={`col-start-1 row-start-1 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
                      i === active
                        ? "translate-y-0 opacity-100"
                        : i < active
                        ? "-translate-y-3 opacity-0"
                        : "translate-y-3 opacity-0"
                    }`}
                  >
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-blue">
                      Sector {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-[clamp(28px,2.2vw+14px,42px)] text-navy">{ind.name}</h3>
                    <p className="mt-4 max-w-[46ch] text-[15.5px] leading-[1.65] text-steel">
                      {ind.copy}
                    </p>
                  </div>
                ))}
              </div>

              {/* progress — present but deliberately understated */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {INDUSTRIES.map((ind, i) => (
                    <span
                      key={ind.key}
                      className={`h-1.5 rounded-full transition-all duration-500 motion-reduce:transition-none ${
                        i === active ? "w-6 bg-blue" : "w-1.5 bg-line"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs tracking-[0.08em] text-steel">
                  {String(active + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* RIGHT — image stack, absolutely layered and crossfaded */}
            <div className="relative h-[min(58vh,520px)] w-full overflow-hidden rounded-[20px] border border-line shadow-[0_20px_44px_-20px_rgba(11,42,74,0.35)]">
              {INDUSTRIES.map((ind, i) => (
                <div
                  key={ind.key}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
                    i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                  }`}
                  style={
                    ind.image
                      ? { backgroundImage: `url(${ind.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: ind.gradient }
                  }
                  role="img"
                  aria-label={`${ind.name} — illustration`}
                >
                  <span className="absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm">
                    <IndustryIcon icon={ind.icon} />
                  </span>
                  <span className="absolute bottom-6 left-6 font-mono text-[11px] uppercase tracking-[0.12em] text-white/75">
                    {ind.tag}
                  </span>
                </div>
              ))}
            </div>
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
