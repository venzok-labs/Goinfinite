import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../../components/Nav";
import ContactTrigger from "../../../components/ContactTrigger";
import { PROJECTS, getProjectBySlug } from "../../../lib/projects";

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

  // This page is a deliberately dark "story" section on an otherwise light
  // site (matching the reference project-card format), so colors here are
  // fixed hex values, not the light-theme tokens — it must look identical
  // regardless of a viewer's light/dark system setting.
  return (
    <div className="bg-[#0c1826]">
      <Nav />

      <header className="py-10 pb-11">
        <div className="wrap">
          <div className="font-mono text-xs text-[#7a93ad] [&_a]:text-[#7a93ad] [&_a:hover]:text-white">
            <Link href="/">Home</Link> / Projects / {project.client} — {project.title}
          </div>

          <div className="mt-[22px] font-mono text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#6fb3ff]">
            {project.industry}
          </div>
          <div className="mt-3.5 flex items-center gap-3">
            {project.logo ? (
              // Real brand mark's native blue tones read almost identical to
              // the solid-blue badge, so it goes on a light badge instead —
              // otherwise it nearly disappears (see components/Logo.jsx).
              <span className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-[10px] border border-white/10 bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.logo}
                  alt={`${project.client} logo`}
                  className="h-full w-full object-contain"
                  style={project.logoZoom ? { transform: `scale(${project.logoZoom})` } : undefined}
                />
              </span>
            ) : (
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] bg-nav-bg font-display text-base font-bold text-white">
                {project.initials}
              </span>
            )}
            <span className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-[#bcd7f4]">
              {project.client}
            </span>
          </div>
          <h1 className="mt-3.5 max-w-[20ch] text-[clamp(28px,3vw+12px,42px)] text-white">
            {project.title}
          </h1>
          <p className="mt-3 max-w-[64ch] text-base text-[#d3e0ec]">{project.summary}</p>

          {/* Client / Industry / Challenge / Approach fields — same dt/dd
              pattern as the reference card. */}
          <dl className="mt-[26px] flex max-w-[640px] flex-col gap-4">
            {[
              ["Client", project.client],
              ["Challenge", project.challenge],
              ["Approach", project.approach],
              ["Outcome", project.outcome],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7a93ad]">
                  {label}
                </dt>
                <dd className="mt-1 text-[15px] leading-[1.55] text-[#d3e0ec]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-[20px] border border-white/18 p-[5px_12px] font-mono text-[11px] text-[#e3f0fc]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="border-t border-b border-white/8">
        <div className="wrap flex flex-wrap p-[22px_32px]">
          <div className="min-w-[130px] flex-1 border-r border-white/8 px-[18px] last:border-r-0">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#7a93ad]">
              Programme
            </div>
            <div className="mt-1 font-display text-[14.5px] font-semibold text-white">
              {project.programme}
            </div>
          </div>
          <div className="min-w-[130px] flex-1 border-r border-white/8 px-[18px] last:border-r-0">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#7a93ad]">
              Services
            </div>
            <div className="mt-1 font-display text-[14.5px] font-semibold text-white">
              {project.servicesShort}
            </div>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="wrap">
          <div className="mb-14">
            <h2 className="mb-3 text-[22px] text-white">Process</h2>
            <div className="mt-5 grid grid-cols-4 gap-4 max-[760px]:grid-cols-2">
              {project.steps.map((s, i) => (
                <div key={s} className="rounded-xl border border-white/10 bg-white/[0.03] p-[18px_16px]">
                  <span className="font-mono text-[11px] text-[#6fb3ff]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="mt-2 text-[13.5px] text-white">{s}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-14">
            <h2 className="mb-3 text-[22px] text-white">Engineering Deliverables</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {project.deliverables.map((d) => (
                <span
                  key={d}
                  className="rounded-[20px] border border-current bg-white/[0.04] p-[8px_16px] text-[13px] font-medium opacity-[0.92] [&:nth-child(3n)]:text-[#4fd6b8] [&:nth-child(3n+1)]:text-[#6fb3ff] [&:nth-child(3n+2)]:text-[#f0a95c]"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-14 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 p-[24px_26px]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#7a93ad]">
                Related service
              </div>
              <div className="mt-1.5 font-display text-base font-semibold text-white">
                {project.relatedService.name}
              </div>
            </div>
            <Link href={`/services#service-${project.relatedService.slug}`} className="text-[#6fb3ff]">
              See this service →
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[20px] bg-[linear-gradient(120deg,var(--panel-1),var(--panel-2))] p-[44px_40px]">
            <div>
              <h2 className="text-2xl text-white">Have a Similar Engineering Challenge?</h2>
              <p className="mt-1.5 text-sm text-[#d3e4f5]">
                Tell us about your requirement and we'll help identify the right approach.
              </p>
            </div>
            <ContactTrigger className="btn btn-white">Discuss Your Project →</ContactTrigger>
          </div>
        </div>
      </div>
    </div>
  );
}
