import Reveal from "./Reveal";
import styles from "./Industries.module.css";

const INDUSTRIES = [
  {
    name: "Automotive",
    copy: "Product development, engineering measurement, CAE validation, manufacturing support, and component engineering.",
  },
  {
    name: "Aerospace",
    copy: "Precision engineering, complex component development, measurement, and engineering analysis.",
  },
  {
    name: "Heavy Engineering",
    copy: "Industrial equipment, machinery, reverse engineering, manufacturing engineering, and engineering problem solving.",
  },
  {
    name: "Shipbuilding",
    copy: "Mechanical components, engineering measurement, product development, and manufacturing support.",
  },
  {
    name: "Defence",
    copy: "Engineering design support, product development, measurement, and validation‑related engineering services.",
  },
  {
    name: "Industrial Equipment & Machinery",
    copy: "Custom engineering, machine development, reverse engineering, and product improvement.",
  },
  {
    name: "Energy & Process Industries",
    copy: "Engineering services for industrial equipment, machinery, and plant‑related components.",
  },
];

export default function Industries() {
  return (
    <section id="industries">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow">Industries we serve</div>
          <h2 className={styles.h2}>Engineering Experience Across Industries</h2>
          <p className={styles.lede}>
            Different engineering environments call for different judgement — our experience
            spans the following sectors.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {INDUSTRIES.map((ind) => (
            <Reveal key={ind.name} as="article" className={styles.card}>
              <h4>{ind.name}</h4>
              <p>{ind.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
