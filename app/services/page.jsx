import Link from "next/link";
import Nav from "../../components/Nav";
import ContactTrigger from "../../components/ContactTrigger";
import ServicesContactAutoOpen from "../../components/ServicesContactAutoOpen";

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
      <ServicesContactAutoOpen />

      <header className="bg-nav-bg py-16 pb-14">
        <div className="wrap">
          <div className="font-mono text-[12.5px] text-[#bcd7f4] [&_a]:text-[#bcd7f4] [&_a:hover]:text-white">
            <Link href="/">Home</Link> / Services
          </div>
          <h1 className="mt-3.5 text-[clamp(32px,3vw+16px,48px)] text-white">Engineering Services</h1>
          <p className="mt-3 max-w-[60ch] text-[16.5px] text-[#d3e4f5]">
            One engineering partner, six connected capabilities — from the first concept to a
            validated, manufacturable product.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="flex flex-col gap-16 py-[72px]">
            {SERVICES.map((s) => (
              <article
                key={s.no}
                id={`service-${s.no}`}
                // offsets the anchor landing spot so the sticky nav (72px)
                // never covers the top of the section when jumping here
                // from a Home-page link
                className="grid scroll-mt-[92px] grid-cols-[0.85fr_1.15fr] items-center gap-10 even:[direction:rtl] even:[&>*]:[direction:ltr] max-[860px]:grid-cols-1 max-[860px]:[direction:ltr]"
              >
                <div
                  className="min-h-[280px] rounded-2xl bg-panel-1 bg-cover bg-center shadow-[0_14px_34px_-18px_rgba(11,42,74,0.35)]"
                  style={
                    s.image
                      ? { backgroundImage: `url(${s.image})` }
                      : { background: "linear-gradient(145deg, var(--panel-1), var(--panel-3))" }
                  }
                  role="img"
                  aria-label={`${s.title} — illustration`}
                />
                <div>
                  <span className="font-mono text-xs tracking-[0.06em] text-blue">{s.no}</span>
                  <h2 className="mt-2 text-[26px]">{s.title}</h2>
                  <p className="mt-1.5 text-[15px] font-semibold text-blue">{s.tagline}</p>
                  <p className="mt-3 text-[15.5px] leading-[1.6] text-steel">{s.copy}</p>
                  {/* Each capability its own pill, colour cycling through
                      three accent tones so the list reads as distinct points
                      rather than one block of uniform grey tags. */}
                  <ul className="mt-5 flex list-none flex-wrap gap-2.5 p-0">
                    {s.capabilities.map((c) => (
                      <li
                        key={c}
                        className="rounded-[20px] border border-current bg-white p-[8px_16px] text-[13.5px] font-medium opacity-[0.92] [&:nth-child(3n)]:text-[#0f8a7a] [&:nth-child(3n+1)]:text-[#1d6fbf] [&:nth-child(3n+2)]:text-[#b3690a]"
                      >
                        {c}
                      </li>
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
          <div className="mb-20 flex flex-wrap items-center justify-between gap-7 rounded-[20px] bg-[linear-gradient(120deg,var(--panel-1),var(--panel-2))] p-[48px_44px]">
            <div>
              <h2 className="text-2xl text-white">Have an Engineering Challenge?</h2>
              <p className="mt-2 text-[14.5px] text-[#d3e4f5]">
                Tell us about your requirement and we'll help identify the right approach.
              </p>
            </div>
            <ContactTrigger className="btn btn-white">Discuss Your Project →</ContactTrigger>
          </div>
        </div>
      </section>
    </>
  );
}
