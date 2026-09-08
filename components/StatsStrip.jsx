"use client";

import { useEffect, useRef, useState } from "react";
import Counter from "./Counter";
import styles from "./StatsStrip.module.css";

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
            setInView(true);
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
    <div className={styles.statsStrip}>
      <div className={`wrap ${styles.statsRow}`} ref={rowRef}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`${styles.stat} ${inView ? styles.in : ""}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            {"text" in s ? <b>{s.text}</b> : <Counter value={s.value} suffix={s.suffix} plain={s.plain} />}
            <span>{s.label}</span>
            <i className={styles.underline} style={{ transitionDelay: `${i * 90 + 260}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
