import Link from "next/link";
import Reveal from "./Reveal";
import { PROJECTS } from "../lib/projects";
import styles from "./ProjectBanner.module.css";

// Duplicated once so the CSS marquee loop is seamless — the track scrolls
// exactly half its total width, then the (identical) second half takes over
// with no visible jump/reset.
const TRACK = [...PROJECTS, ...PROJECTS];

// Homepage-only teaser: logos and nothing else. Full project details
// (challenge/approach/outcome) live exclusively on each project's own page —
// see components/Projects.jsx, kept unused for a future /projects hub.
export default function ProjectBanner() {
  return (
    <section id="projects" className={styles.banner}>
      <div className="wrap">
        <Reveal className={styles.head}>
          <div className="eyebrow">Selected projects</div>
          <h3 className={styles.h3}>Trusted by engineering teams across industries</h3>
          <p className={styles.sub}>Click any client to see the full project</p>
        </Reveal>
      </div>

      <div className={styles.marquee}>
        <div className={styles.track} aria-hidden={false}>
          {TRACK.map((p, i) => (
            <Link
              key={`${p.slug}-${i}`}
              href={`/projects/${p.slug}`}
              className={styles.badge}
              // the duplicated set is decorative for the animation — hide it
              // from assistive tech so each project is only announced once
              aria-hidden={i >= PROJECTS.length}
              tabIndex={i >= PROJECTS.length ? -1 : 0}
            >
              <span className={styles.mark}>{p.initials}</span>
              <span className={styles.meta}>
                <span className={styles.client}>{p.client}</span>
                <span className={styles.proj}>{p.programme}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
