"use client";

import { useEffect, useRef, useState } from "react";
import Counter from "./Counter";

const STATS = [
  { value: 25, suffix: "+", label: "Years Experience" },
  { value: 10, label: "Years at FARO" },
  { value: 100, suffix: "+", label: "Engineers Led" },
  { text: "USA·SG", label: "Technical Training" },
  { value: 2017, plain: true, label: "Founded" },
];

export default function StatsStrip() {
  const rowRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const el = rowRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // The strip sits right under the hero, so on first load it's
            // already inside the viewport and this callback can fire before
            // the browser has painted the initial opacity-0 state — the
            // reveal would then just snap in instead of transitioning.
            // Deferring one frame guarantees that first paint happens first.
            requestAnimationFrame(() => setInView(true));
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.35 }
    );
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="border-t border-b border-line bg-white">
      <div className="wrap flex flex-wrap p-[26px_32px]" ref={rowRef}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`relative min-w-[120px] flex-1 border-r border-line pb-1 text-center transition-[opacity,transform] duration-[2100ms] ease-[cubic-bezier(0.22,1,0.36,1)] last:border-r-0 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 ${
              inView ? "translate-y-0 scale-100 opacity-100" : "translate-y-[26px] scale-[0.94] opacity-0"
            }`}
            style={{ transitionDelay: `${i * 180}ms` }}
          >
            {"text" in s ? (
              <b className="block font-display text-[26px] tabular-nums text-navy transition-colors duration-300">
                {s.text}
              </b>
            ) : (
              <Counter
                value={s.value}
                suffix={s.suffix}
                plain={s.plain}
                className="block font-display text-[26px] tabular-nums text-navy transition-colors duration-300"
              />
            )}
            <span className="text-[11.5px] uppercase tracking-[0.04em] text-steel">{s.label}</span>
            <i
              className={`mx-auto mt-2 block h-0.5 w-7 origin-center rounded-sm bg-blue transition-transform duration-[1700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:scale-x-100 ${
                inView ? "scale-x-100" : "scale-x-0"
              }`}
              style={{ transitionDelay: `${i * 180 + 500}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
