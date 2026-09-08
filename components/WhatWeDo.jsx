import Link from "next/link";
import Reveal from "./Reveal";
import styles from "./WhatWeDo.module.css";

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

export default function WhatWeDo() {
  return (
    <section id="what-we-do">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className={`eyebrow ${styles.eyebrow}`}>What we do</div>
          <h2 className={styles.h2}>One Engineering Partner. Multiple Capabilities.</h2>
          <p className={styles.lede}>
            A successful product must be designed correctly, validated under real operating
            conditions, measured accurately, manufactured reliably, and tested before it reaches
            the customer — we bring all of it together under one roof.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {STEPS.map((s) => {
            const isLast = s.no === "06";
            return (
              <Reveal key={s.no} as="article" className={styles.card}>
                <div
                  className={styles.image}
                  style={
                    s.image
                      ? { backgroundImage: `url(${s.image})` }
                      : { background: "linear-gradient(145deg, var(--panel-1), var(--panel-3))" }
                  }
                  role="img"
                  aria-label={`${s.title} — illustration`}
                />
                <div className={styles.scrim} />
                <div className={styles.content}>
                  <span className={styles.no}>{s.no}</span>
                  <h4>{s.title}</h4>
                  <p>{s.copy}</p>
                  {isLast && (
                    <Link href="/services" className={styles.cardCta}>
                      See How It Works →
                    </Link>
                  )}
                </div>
                <Link
                  href={`/services#service-${s.no}`}
                  className={`${styles.cardLink} ${isLast ? styles.cardLinkShort : ""}`}
                  aria-label={`${s.title} — see this service on the Services page`}
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
