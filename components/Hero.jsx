import Link from "next/link";
import Logo from "./Logo";
import GearboxHero from "./GearboxHero";
import StatsStrip from "./StatsStrip";
import ContactTrigger from "./ContactTrigger";

export default function Hero() {
  return (
    <header className="relative">
      {/* Single unified banner: both sides sit on the exact same solid
          #076bdd — no color split at all. Copy/logo switch to white/light
          variants here since they were designed for a light background. */}
      <div className="grid min-h-[540px] grid-cols-[1.05fr_0.95fr] bg-nav-bg max-[900px]:min-h-0 max-[900px]:grid-cols-1">
        <div
          // pl floor matches every other section's mobile inset (the shared
          // `.wrap` class resolves to 20px there) — this used a bespoke
          // clamp starting at 24px, 4px further right than everywhere else.
          className="reveal in flex min-w-0 flex-col justify-center pt-7 pr-[clamp(8px,1.5vw,16px)] pb-11 pl-[clamp(20px,5vw,64px)]"
        >
          <Logo size={40} onDark className="mb-4" />
          <div className="eyebrow text-[14.5px] text-[#bcd7f4]">
            Engineering Solutions for a Better Tomorrow · Est. 2017
          </div>
          {/* scales with viewport width so it never has to fight the model's
              column for room at in-between widths just above the stacking
              breakpoint — full size only once there's enough space for it */}
          <h1 className="mt-4 max-w-[20ch] break-words text-[clamp(34px,4vw+12px,56px)] text-white">
            Engineering Intelligence.
            <br />
            <span className="text-[#8fc9ff]">From Concept to Reality.</span>
          </h1>
          <p className="mt-5 max-w-[70ch] text-[clamp(15px,1vw+12px,18.5px)] leading-[1.55] text-[#d3e4f5]">
            25+ years of engineering experience across automotive, aerospace, heavy engineering,
            shipbuilding and defence — covering Concept Design, CAE Validation, Advanced
            Measurement, Manufacturing, Testing and Special‑Purpose Machine Development.
          </p>
          <p className="mt-3 max-w-[70ch] text-[clamp(15px,1vw+12px,18.5px)] leading-[1.55] text-[#d3e4f5]">
            Our experience combines strong technical knowledge with practical, real‑world
            engineering solutions, helping turn complex requirements into reliable and
            manufacturable results.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3">
            <ContactTrigger className="btn btn-white">Discuss Your Project →</ContactTrigger>
            <Link className="btn btn-ghost-white" href="/services">
              Explore Services
            </Link>
          </div>
        </div>

        <div className="reveal in flex items-stretch justify-center py-4 pr-[clamp(20px,4vw,40px)] pl-[clamp(12px,3vw,28px)] [&>*]:min-w-0 [&>*]:flex-1">
          <GearboxHero />
        </div>
      </div>

      <StatsStrip />
    </header>
  );
}
