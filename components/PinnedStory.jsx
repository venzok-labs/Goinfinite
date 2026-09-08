import Logo from "./Logo";
import GearboxHero from "./GearboxHero";
import StatsStrip from "./StatsStrip";
import ContactTrigger from "./ContactTrigger";

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
    <section className="relative">
      <div className="grid grid-cols-[0.95fr_1.05fr] max-[900px]:grid-cols-1">
        <div className="sticky top-0 h-screen overflow-hidden bg-nav-bg max-[900px]:static max-[900px]:h-[60vh] max-[900px]:min-h-[360px]">
          <div className="h-full p-6">
            <GearboxHero />
          </div>
        </div>

        <div className="min-w-0">
          <div className="reveal in flex min-h-screen flex-col justify-center bg-nav-bg py-14 px-[clamp(24px,5vw,64px)] max-[900px]:min-h-0 max-[900px]:pt-10">
            <Logo size={40} onDark className="mb-[26px]" />
            <div className="eyebrow text-[#bcd7f4]">
              Engineering Solutions for a Better Tomorrow · Est. 2017
            </div>
            <h1 className="mt-3.5 max-w-[13ch] break-words text-[clamp(32px,3.4vw+10px,50px)] text-white">
              Engineering Intelligence.
              <br />
              <span className="text-[#8fc9ff]">From Concept to Reality.</span>
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-[1.6] text-[#d3e4f5]">
              25+ years of engineering experience across automotive, aerospace, heavy engineering,
              shipbuilding and defence — covering Concept Design, CAE Validation, Advanced
              Measurement, Manufacturing, Testing and Special‑Purpose Machine Development.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ContactTrigger className="btn btn-white">Discuss Your Project →</ContactTrigger>
              <a className="btn btn-ghost-white" href="#services">
                Explore Services
              </a>
            </div>
          </div>

          <StatsStrip />

          <div className="bg-white py-16 px-[clamp(24px,5vw,64px)]">
            <div className="eyebrow">What we do</div>
            <h2 className="mt-2.5 text-[30px]">One Engineering Partner. Multiple Capabilities.</h2>
            <p className="mt-3 text-[15.5px] text-steel">
              A successful product must be designed correctly, validated under real operating
              conditions, measured accurately, manufactured reliably, and tested before it
              reaches the customer — we bring all of it together under one roof.
            </p>

            <div className="mt-8 flex flex-col gap-[18px]">
              {STEPS.map((s) => (
                <article
                  key={s.no}
                  className="group relative flex min-h-[220px] items-end overflow-hidden rounded-[14px] shadow-[0_14px_34px_-18px_rgba(11,42,74,0.35)] transition-[transform,box-shadow] duration-[250ms] ease-out hover:-translate-y-[3px] hover:shadow-[0_18px_40px_-16px_rgba(11,42,74,0.42)]"
                >
                  <div
                    className="absolute inset-0 scale-[1.02] bg-panel-1 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                    style={
                      s.image
                        ? { backgroundImage: `url(${s.image})` }
                        : { background: "linear-gradient(145deg, var(--panel-1), var(--panel-3))" }
                    }
                    role="img"
                    aria-label={`${s.title} — illustration`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,20,38,0)_34%,rgba(6,20,38,0.88)_100%)]" />
                  <div className="relative z-[2] p-[22px]">
                    <span className="font-mono text-[11.5px] tracking-[0.06em] text-[#8fc9ff]">
                      {s.no}
                    </span>
                    <h4 className="mt-2 text-lg text-white">{s.title}</h4>
                    <p className="mt-1.5 text-[13.5px] leading-normal text-white/86">{s.copy}</p>
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
