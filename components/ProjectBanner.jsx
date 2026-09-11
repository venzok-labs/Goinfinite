import Link from "next/link";
import Reveal from "./Reveal";
import { PROJECTS } from "../lib/projects";

// Duplicated once so the CSS marquee loop is seamless — the track scrolls
// exactly half its total width, then the (identical) second half takes over
// with no visible jump/reset.
const TRACK = [...PROJECTS, ...PROJECTS];

// Homepage-only teaser: logos and nothing else. Full project details
// (challenge/approach/outcome) live exclusively on each project's own page —
// see components/Projects.jsx, kept unused for a future /projects hub.
export default function ProjectBanner() {
  return (
    <section id="projects" className="scroll-mt-[92px] bg-white py-[88px] pb-24 max-[620px]:py-16 max-[620px]:pb-[72px]">
      <div className="wrap">
        <Reveal className="mx-auto mb-11 max-w-[640px] text-center">
          <div className="eyebrow">Selected projects</div>
          <h3 className="mt-2.5 text-balance font-display text-[30px] font-semibold text-navy max-[620px]:text-2xl">
            Trusted by engineering teams across industries
          </h3>
          <p className="mt-2.5 text-[15px] text-steel">Click any client to see the full project</p>
        </Reveal>
      </div>

      <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,#000_64px,#000_calc(100%-64px),transparent_100%)]">
        <div
          className="flex w-max animate-[scroll_32s_linear_infinite] items-stretch gap-5 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          aria-hidden={false}
        >
          {TRACK.map((p, i) => (
            <Link
              key={`${p.slug}-${i}`}
              href={`/projects/${p.slug}`}
              className="flex flex-none items-center gap-3.5 rounded-2xl border border-line bg-white p-[16px_24px] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-[3px] hover:border-blue hover:shadow-[0_14px_30px_-18px_rgba(7,107,221,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 max-[620px]:p-[13px_18px]"
              // the duplicated set is decorative for the animation — hide it
              // from assistive tech so each project is only announced once
              aria-hidden={i >= PROJECTS.length}
              tabIndex={i >= PROJECTS.length ? -1 : 0}
            >
              {p.logo ? (
                // The real brand mark's native blue tones read almost
                // identical to the solid-blue badge used for initials, so
                // it goes on a light badge instead — otherwise it nearly
                // disappears (see components/Logo.jsx).
                <span className="flex h-[46px] w-[46px] flex-none items-center justify-center overflow-hidden rounded-[10px] border border-line bg-white p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logo}
                    alt={`${p.client} logo`}
                    className="h-full w-full object-contain"
                    style={p.logoZoom ? { transform: `scale(${p.logoZoom})` } : undefined}
                  />
                </span>
              ) : (
                <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[10px] bg-nav-bg font-display text-[15px] font-bold tracking-[0.02em] text-white">
                  {p.initials}
                </span>
              )}
              <span className="flex flex-col gap-0.5 whitespace-nowrap">
                <span className="font-display text-[14.5px] font-semibold text-navy">{p.client}</span>
                <span className="text-xs text-steel">{p.programme}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
