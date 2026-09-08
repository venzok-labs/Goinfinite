import Link from "next/link";
import Reveal from "./Reveal";
import { PROJECTS } from "../lib/projects";
import styles from "./Projects.module.css";

export default function Projects() {
  return (
    <section id="projects" className={styles.section}>
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow">Projects &amp; case studies</div>
          <h2 className={styles.h2}>Engineering Challenges. Practical Solutions.</h2>
          <p className={styles.lede}>
            A track record across named programmes — not just a list of services. Click any
            project for the full case study.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {PROJECTS.map((p) => (
            <Reveal key={p.slug} as="article" className={styles.card}>
              <Link href={`/projects/${p.slug}`} className={styles.cardLink} aria-label={`${p.title} — ${p.client}`} />
              <div className={styles.photo} aria-hidden="true">
                <span className={styles.photoLabel}>Project photo / labelled illustration</span>
              </div>
              <div className={styles.content}>
                <div className={styles.industry}>{p.industry}</div>
                <h3 className={styles.title}>{p.title}</h3>

                <dl className={styles.fields}>
                  <div>
                    <dt>Client</dt>
                    <dd>{p.client}</dd>
                  </div>
                  <div>
                    <dt>Challenge</dt>
                    <dd>{p.challenge}</dd>
                  </div>
                  <div>
                    <dt>Approach</dt>
                    <dd>{p.approach}</dd>
                  </div>
                  <div>
                    <dt>Outcome</dt>
                    <dd>{p.outcome}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
