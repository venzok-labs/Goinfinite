import Link from "next/link";
import Reveal from "./Reveal";
import { PROJECTS } from "../lib/projects";

export default function Projects() {
  return (
    <section id="projects">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="eyebrow">Projects &amp; case studies</div>
          <h2 className="text-[32px]">Engineering Challenges. Practical Solutions.</h2>
          <p className="max-w-[62ch] text-base">
            A track record across named programmes — not just a list of services. Click any
            project for the full case study.
          </p>
        </Reveal>

        <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
          {PROJECTS.map((p) => (
            <Reveal
              key={p.slug}
              as="article"
              className="relative flex flex-col overflow-hidden rounded-2xl bg-[#0c1826] shadow-[0_14px_34px_-18px_rgba(11,42,74,0.4)] transition-[transform,box-shadow] duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-[0_20px_44px_-16px_rgba(11,42,74,0.5)]"
            >
              <Link
                href={`/projects/${p.slug}`}
                className="absolute inset-0 z-[3] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-[3px] focus-visible:outline-white"
                aria-label={`${p.title} — ${p.client}`}
              />
              {/* Placeholder for a real project photo — a subtle diagonal texture
                  rather than a blank block, so the grid reads as "photo coming"
                  not "broken image". */}
              <div
                aria-hidden="true"
                className="flex aspect-[16/10] w-full items-center justify-center bg-[#0c1826] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_2px,transparent_2px,transparent_14px)] p-3"
              >
                <span className="text-center font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/40">
                  Project photo / labelled illustration
                </span>
              </div>
              <div className="flex flex-1 flex-col p-[22px_22px_26px]">
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6fb3ff]">
                  {p.industry}
                </div>
                <h3 className="mt-2 font-display text-[19px] font-semibold leading-[1.3] text-white">
                  {p.title}
                </h3>

                <dl className="mt-[18px] flex flex-col gap-3">
                  {[
                    ["Client", p.client],
                    ["Challenge", p.challenge],
                    ["Approach", p.approach],
                    ["Outcome", p.outcome],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7a93ad]">
                        {label}
                      </dt>
                      <dd className="mt-1 line-clamp-2 text-[13.5px] leading-normal text-[#d3e0ec]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
