import Link from "next/link";
import Logo from "./Logo";
import ContactTrigger from "./ContactTrigger";

const COMPANY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#industries", label: "Industries" },
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
];

const SERVICE_LINKS = [
  { href: "/services#service-01", label: "Concept & Product Design" },
  { href: "/services#service-02", label: "CAE Product Validation" },
  { href: "/services#service-03", label: "Measurement & Reverse Engineering" },
  { href: "/services#service-04", label: "Manufacturing Engineering" },
  { href: "/services#service-05", label: "Product Testing" },
  { href: "/services#service-06", label: "SPM Design & Development" },
];

function ContactRow({ label, value, href, icon }) {
  const Value = href ? "a" : "span";
  return (
    <li className="flex items-start gap-2.5">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-none text-blue">
        {icon}
      </svg>
      <span>
        <span className="block text-[10.5px] text-steel/70">{label}</span>
        <Value
          {...(href ? { href } : {})}
          className="text-[14px] leading-[1.4] text-navy no-underline hover:text-blue"
        >
          {value}
        </Value>
      </span>
    </li>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      {/* CTA banner — same solid brand blue as the Hero banner, giving the
          page one last conversion moment before the visitor leaves. */}
      <div className="bg-nav-bg">
        <div className="wrap flex flex-wrap items-center justify-between gap-6 py-11">
          <div>
            <h3 className="max-w-[32ch] text-[26px] font-semibold text-white">
              Have an engineering problem worth solving?
            </h3>
            <p className="mt-1.5 max-w-[48ch] text-[15px] text-white/82">
              25+ years of experience across automotive, aerospace, heavy engineering, shipbuilding and
              defence — let&apos;s talk about your project.
            </p>
          </div>
          <ContactTrigger className="btn btn-white flex-none">Discuss Your Project →</ContactTrigger>
        </div>
      </div>

      <div className="wrap grid grid-cols-[1.2fr_auto_auto_auto] gap-10 py-13 max-[900px]:grid-cols-2 max-[900px]:gap-y-9 max-[560px]:grid-cols-2 max-[560px]:gap-x-6">
        <div className="max-[560px]:hidden">
          <Logo size={26} />
          <p className="mt-3 max-w-[32ch] text-[13.5px] leading-[1.6] text-steel">
            Engineering Solutions for a Better Tomorrow.
          </p>
          <span className="mt-4 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-blue">
            Est. 2017 · Chennai, India
          </span>
        </div>

        <nav>
          <h4 className="mb-4 font-mono text-[11.5px] font-bold uppercase tracking-[0.06em] text-navy">
            Company
          </h4>
          <ul className="flex flex-col gap-[11px] whitespace-nowrap">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-steel no-underline hover:text-blue max-[560px]:text-[11px]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <h4 className="mb-4 font-mono text-[11.5px] font-bold uppercase tracking-[0.06em] text-navy">
            Services
          </h4>
          <ul className="flex flex-col gap-[11px]">
            {SERVICE_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`text-sm text-steel no-underline hover:text-blue max-[560px]:text-[11px] ${
                    l.label === "Measurement & Reverse Engineering" ? "" : "max-[560px]:whitespace-nowrap"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-[560px]:col-span-2">
          <h4 className="mb-4 font-mono text-[11.5px] font-bold uppercase tracking-[0.06em] text-navy">
            Get in Touch
          </h4>
          <ul className="flex flex-col gap-3.5">
            <ContactRow
              label="Address"
              value="Chennai, Tamil Nadu, India"
              icon={
                <path
                  d="M12 21s7-6.1 7-11.5S15.9 3 12 3 5 4.6 5 9.5 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              }
            />
            <ContactRow
              label="Phone"
              value="+91 98418 61609"
              href="tel:+919841861609"
              icon={
                <path
                  d="M4 5c0-.6.4-1 1-1h2.4c.5 0 .9.3 1 .8l.9 3.4c.1.4 0 .8-.3 1.1L7.6 10.7a12 12 0 0 0 5.7 5.7l1.4-1.4c.3-.3.7-.4 1.1-.3l3.4.9c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1.5C9.9 20 4 14.1 4 6.5V5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              }
            />
            <ContactRow
              label="Email"
              value="raman.baskaran@goinfinite.in"
              href="mailto:raman.baskaran@goinfinite.in"
              icon={
                <path
                  d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Zm1 0 7 5.5 7-5.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              }
            />
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-5 text-[12.5px] text-steel/70">
          <span className="font-mono text-[10.5px]">
            © {new Date().getFullYear()} Infinite Solutions. All rights reserved.
          </span>
          <div className="flex flex-wrap gap-5 text-[10px]">
            {/* Privacy Policy / Terms have no page yet — TODO: link these once
                those pages exist. */}
            <span className="cursor-not-allowed" title="Page not published yet">
              Privacy Policy
            </span>
            <span className="cursor-not-allowed" title="Page not published yet">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
