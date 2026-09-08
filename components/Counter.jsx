"use client";

import { useEffect, useRef, useState } from "react";

// Counts up from 0 to `value` once it scrolls into view, then gives the
// number a brief "pop" (scale + color flash) the instant it lands.
export default function Counter({ value, suffix = "", plain = false, className = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(plain ? "0" : "0");
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!el) return;

    if (reduced || !("IntersectionObserver" in window)) {
      setDisplay((plain ? value : value.toLocaleString("en-IN")) + suffix);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(el);
          const start = performance.now();
          const dur = 1200;
          function step(ts) {
            const p = Math.min((ts - start) / dur, 1);
            const val = Math.floor(p * value);
            setDisplay((plain ? val : val.toLocaleString("en-IN")) + (p >= 1 ? suffix : ""));
            if (p < 1) {
              requestAnimationFrame(step);
            } else {
              setPopped(true);
            }
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, suffix, plain]);

  return (
    <b
      ref={ref}
      className={`${className} ${popped ? "animate-counter-pop motion-reduce:animate-none" : ""}`}
    >
      {display}
    </b>
  );
}
