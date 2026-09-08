import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../../components/Nav";
import { PROJECTS, getProjectBySlug } from "../../../lib/projects";
import styles from "./project.module.css";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.client} | Infinite Solutions`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.photo} aria-hidden="true">
        <span className={styles.photoLabel}>Project photo / labelled illustration</span>
      </div>

      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.crumb}>
            <Link href="/">Home</Link> / Projects / {project.client} — {project.title}
          </div>

          <div className={styles.industry}>{project.industry}</div>
          <div className={styles.clientRow}>
            <span className={styles.mark}>{project.initials}</span>
            <span className={styles.clientName}>{project.client}</span>
          </div>
          <h1 className={styles.h1}>{project.title}</h1>
          <p className={styles.sub}>{project.summary}</p>

          <dl className={styles.fields}>
            <div>
              <dt>Client</dt>
              <dd>{project.client}</dd>
            </div>
            <div>
              <dt>Challenge</dt>
              <dd>{project.challenge}</dd>
            </div>
            <div>
              <dt>Approach</dt>
              <dd>{project.approach}</dd>
            </div>
            <div>
              <dt>Outcome</dt>
              <dd>{project.outcome}</dd>
            </div>
          </dl>

          <div className={styles.chipRow}>
            {project.tags.map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.facts}>
        <div className={`wrap ${styles.factsRow}`}>
          <div className={styles.fact}>
            <div className={styles.factK}>Programme</div>
            <div className={styles.factV}>{project.programme}</div>
          </div>
          <div className={styles.fact}>
            <div className={styles.factK}>Services</div>
            <div className={styles.factV}>{project.servicesShort}</div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.section}>
            <h2 className={styles.h2}>Process</h2>
            <div className={styles.steps}>
              {project.steps.map((s, i) => (
                <div key={s} className={styles.step}>
                  <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
                  <h4>{s}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.h2}>Engineering Deliverables</h2>
            <div className={styles.pills}>
              {project.deliverables.map((d) => (
                <span key={d} className={styles.pill}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.related}>
            <div>
              <div className={styles.relatedLbl}>Related service</div>
              <div className={styles.relatedSvc}>{project.relatedService.name}</div>
            </div>
            <Link href={`/services#service-${project.relatedService.slug}`}>See this service →</Link>
          </div>

          <div className={styles.ctaband}>
            <div>
              <h2 className={styles.ctaH2}>Have a Similar Engineering Challenge?</h2>
              <p className={styles.ctaP}>Tell us about your requirement and we'll help identify the right approach.</p>
            </div>
            <Link className="btn btn-white" href="/#contact">
              Discuss Your Project →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
