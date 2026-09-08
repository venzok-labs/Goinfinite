import Link from "next/link";
import Nav from "../../components/Nav";
import styles from "./services.module.css";

export const metadata = {
  title: "Engineering Services — Infinite Solutions",
  description:
    "Concept & product design, CAE validation, engineering measurement & reverse engineering, manufacturing engineering, product testing, and special-purpose machine development.",
};

const SERVICES = [
  {
    no: "01",
    title: "Concept & Product Design",
    tagline: "From Engineering Idea to Practical Product",
    image: "/images/what-we-do/concept-design.webp",
    copy: "We help transform engineering concepts, sketches, existing components, and customer requirements into practical product designs — combining design creativity with engineering discipline.",
    capabilities: [
      "Concept development",
      "Mechanical product design",
      "3D CAD modelling",
      "Assembly design",
      "Design detailing & modifications",
      "Engineering drawings",
      "Design‑for‑manufacturing input",
      "Product development support",
    ],
  },
  {
    no: "02",
    title: "CAE Product Validation",
    tagline: "Validate Before You Manufacture",
    image: "/images/what-we-do/cae-validation.webp",
    copy: "Simulation‑led engineering decisions — evaluating design performance, understanding failure risks, and informing manufacturing choices before a single part is cut.",
    capabilities: [
      "Finite Element Analysis (FEA)",
      "Structural, static & dynamic analysis",
      "Thermal analysis",
      "Computational Fluid Dynamics (CFD)",
      "Flow & pressure‑drop analysis",
      "Design optimisation",
      "Simulation‑based product validation",
    ],
  },
  {
    no: "03",
    title: "Engineering Measurement & Reverse Engineering",
    tagline: "From Physical Components to Engineering Data",
    image: "/images/what-we-do/measurement.webp",
    copy: "When the drawing is missing, the part is complex, or the existing design needs to be understood — we help create the engineering data, from portable 3D measurement to full reverse‑engineered CAD.",
    capabilities: [
      "3D measurement & portable CMM",
      "Laser scanning",
      "Dimensional inspection",
      "Reverse engineering",
      "CAD model development from physical parts",
      "As‑built documentation",
      "Design verification",
    ],
  },
  {
    no: "04",
    title: "Manufacturing Engineering",
    tagline: "Designed for Manufacturing. Built for Reality.",
    copy: "Practical engineering inputs, design reviews and production‑oriented problem solving that move a design from correct-on-paper to reliably manufacturable.",
    capabilities: [
      "Manufacturing‑oriented design support",
      "Engineering drawing review",
      "Design modifications",
      "Manufacturing feasibility support",
      "Tooling & fixture development",
      "Production engineering support",
    ],
  },
  {
    no: "05",
    title: "Product Testing",
    tagline: "Engineering Confidence Through Testing",
    copy: "Engineering verification and testing activities that confirm whether a design performs as intended under defined operating conditions.",
    capabilities: [
      "Engineering test planning",
      "Test fixture & setup development",
      "Mechanical testing support",
      "Dimensional & functional verification",
      "Performance testing",
      "Test data analysis & documentation",
    ],
  },
  {
    no: "06",
    title: "Special‑Purpose Machine Design & Development",
    tagline: "Custom Machines for Specific Engineering Problems",
    copy: "A multidisciplinary approach — mechanical design, electrical systems, electronics and PLC programming — for production, assembly, inspection and testing needs an off‑the‑shelf machine can't solve.",
    capabilities: [
      "Special‑purpose machine concept development",
      "Mechanical machine design",
      "Automation system development",
      "Electrical & control systems",
      "Electronics integration",
      "PLC programming",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Nav />

      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.crumb}>
            <Link href="/">Home</Link> / Services
          </div>
          <h1>Engineering Services</h1>
          <p>
            One engineering partner, six connected capabilities — from the first concept to a
            validated, manufacturable product.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className={styles.list}>
            {SERVICES.map((s) => (
              <article key={s.no} className={styles.row} id={`service-${s.no}`}>
                <div
                  className={styles.rowImage}
                  style={
                    s.image
                      ? { backgroundImage: `url(${s.image})` }
                      : { background: "linear-gradient(145deg, var(--panel-1), var(--panel-3))" }
                  }
                  role="img"
                  aria-label={`${s.title} — illustration`}
                />
                <div className={styles.rowContent}>
                  <span className={styles.no}>{s.no}</span>
                  <h2>{s.title}</h2>
                  <p className={styles.tagline}>{s.tagline}</p>
                  <p className={styles.copy}>{s.copy}</p>
                  <ul className={styles.caps}>
                    {s.capabilities.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className={styles.ctaBand}>
            <div>
              <h2>Have an Engineering Challenge?</h2>
              <p>Tell us about your requirement and we'll help identify the right approach.</p>
            </div>
            <Link className="btn btn-white" href="/#contact">
              Discuss Your Project →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
