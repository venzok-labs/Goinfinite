import Logo from "./Logo";
import GearboxHero from "./GearboxHero";
import StatsStrip from "./StatsStrip";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.split}>
        <div className={`${styles.panel1} reveal in`}>
          <Logo size={40} onDark className={styles.logoLockup} />
          <div className={`eyebrow ${styles.eyebrow}`}>
            Engineering Solutions for a Better Tomorrow · Est. 2017
          </div>
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
          <p className={styles.sub}>
            Our experience combines strong technical knowledge with practical, real‑world
            engineering solutions, helping turn complex requirements into reliable and
            manufacturable results.
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

        <div className={`${styles.panel2} reveal in`}>
          <GearboxHero />
        </div>
      </div>

      <StatsStrip />
    </header>
  );
}
