import Logo from "./Logo";
import GearboxHero from "./GearboxHero";
import StatsStrip from "./StatsStrip";
import styles from "./PinnedStory.module.css";

// Same six steps as WhatWeDo.jsx, stacked single-column here since this
// layout shares half the width with the pinned model.
const STEPS = [
  {
    no: "01",
    title: "Concept & Design",
    copy: "Ideas, sketches and requirements into practical CAD.",
    image: "/images/what-we-do/concept-design.webp",
  },
  { no: "02", title: "CAE Validation", copy: "Simulation‑led decisions before manufacturing." },
  { no: "03", title: "Measurement", copy: "3D measurement, scanning & reverse engineering." },
  { no: "04", title: "Manufacturing", copy: "Design reviews, tooling, production support." },
  { no: "05", title: "Testing", copy: "Verification of performance and reliability." },
  { no: "06", title: "SPM Development", copy: "Custom mechanical, electrical & PLC machines." },
];

/*
 * The real hero gearbox stays pinned (CSS `position: sticky`) in the left
 * column while the hero copy AND the "What We Do" content scroll past it in
 * the right column — the model only releases once this section's combined
 * content has fully scrolled by. Apple-product-page style.
 */
export default function PinnedStory() {
  return (
    <section className={styles.story}>
      <div className={styles.grid}>
        <div className={styles.pinCol}>
          <div className={styles.pinStage}>
            <GearboxHero />
          </div>
        </div>

        <div className={styles.scrollCol}>
          <div className={`${styles.heroText} reveal in`}>
            <Logo size={40} onDark className={styles.logoLockup} />
            <div className="eyebrow">Engineering Solutions for a Better Tomorrow · Est. 2017</div>
            <h1 className={styles.h1}>
              Engineering Intelligence.
              <br />
              <span className={styles.accent}>From Concept to Reality.</span>
            </h1>
            <p className={styles.sub}>
              25+ years of engineering experience across automotive, aerospace, heavy engineering,
              shipbuilding and defence — covering Concept Design, CAE Validation, Advanced
              Measurement, Manufacturing, Testing and Special‑Purpose Machine Development.
            </p>
            <div className={styles.ctas}>
              <a className="btn btn-white" href="#contact">
                Discuss Your Project →
              </a>
              <a className="btn btn-ghost-white" href="#services">
                Explore Services
              </a>
            </div>
          </div>

          <StatsStrip />

          <div className={styles.whatWeDo}>
            <div className="eyebrow">What we do</div>
            <h2 className={styles.h2}>One Engineering Partner. Multiple Capabilities.</h2>
            <p className={styles.lede}>
              A successful product must be designed correctly, validated under real operating
              conditions, measured accurately, manufactured reliably, and tested before it
              reaches the customer — we bring all of it together under one roof.
            </p>

            <div className={styles.cards}>
              {STEPS.map((s) => (
                <article key={s.no} className={styles.card}>
                  <div
                    className={styles.cardImage}
                    style={
                      s.image
                        ? { backgroundImage: `url(${s.image})` }
                        : { background: "linear-gradient(145deg, var(--panel-1), var(--panel-3))" }
                    }
                    role="img"
                    aria-label={`${s.title} — illustration`}
                  />
                  <div className={styles.cardScrim} />
                  <div className={styles.cardContent}>
                    <span className={styles.no}>{s.no}</span>
                    <h4>{s.title}</h4>
                    <p>{s.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
