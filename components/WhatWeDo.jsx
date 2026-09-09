"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import CardCarousel from "./CardCarousel";

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
          <div className="eyebrow text-[15px]">What we do</div>
          <h2 className="text-[38px]">One Engineering Partner. Multiple Capabilities.</h2>
          <p className="max-w-[62ch] text-[17px]">
            A successful product must be designed correctly, validated under real operating
            conditions, measured accurately, manufactured reliably, and tested before it reaches
            the customer — we bring all of it together under one roof.
          </p>
        </Reveal>
      </div>

      <CardCarousel
        items={STEPS}
        getKey={(s) => s.no}
        hint="Drag to browse"
        renderCard={(s) => {
          const isLast = s.no === "06";
          return (
            <>
              <div
                className="absolute inset-0 scale-[1.02] bg-panel-1 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
                style={
                  s.image
                    ? { backgroundImage: `url(${s.image})` }
                    : { background: "linear-gradient(145deg, var(--panel-1), var(--panel-3))" }
                }
                role="img"
                aria-label={`${s.title} — illustration`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,20,38,0)_34%,rgba(6,20,38,0.88)_100%)]" />
              <div className="relative z-[2] p-[26px_24px] text-white">
                <span className="font-mono text-xs tracking-[0.06em] text-[#8fc9ff]">{s.no}</span>
                <h4 className="mt-2 text-xl text-white">{s.title}</h4>
                <p className="mt-2 text-sm leading-normal text-white/86">{s.copy}</p>
                {isLast && (
                  <Link
                    href="/services"
                    className="relative mt-3.5 inline-flex items-center gap-2 rounded-full border-[1.5px] border-white/65 px-[18px] py-[9px] font-body text-[13px] font-semibold text-white transition-[background,border-color,transform] duration-200 hover:-translate-y-px hover:border-white hover:bg-white/16"
                  >
                    See How It Works →
                  </Link>
                )}
              </div>
              <Link
                href={`/services#service-${s.no}`}
                className={`absolute inset-0 z-[3] ${isLast ? "bottom-[54px]" : ""} focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-[3px] focus-visible:outline-white`}
                aria-label={`${s.title} — see this service on the Services page`}
              />
            </>
          );
        }}
      />
    </section>
  );
}
