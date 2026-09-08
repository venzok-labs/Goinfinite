import Link from "next/link";
import Logo from "./Logo";
import ContactTrigger from "./ContactTrigger";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/#industries", label: "Industries" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#projects", label: "Projects" },
  { href: "/#insights", label: "Insights" },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-white-a backdrop-blur-[10px]">
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="Infinite Solutions — home">
          <Logo size={32} />
        </Link>

        <div className="flex flex-1 items-center justify-center gap-7 max-[980px]:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm font-medium text-ink after:absolute after:-bottom-[22px] after:left-0 after:right-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-blue after:transition-transform after:duration-200 hover:text-blue hover:after:scale-x-100"
            >
              {l.label}
            </Link>
          ))}
          <ContactTrigger className="relative text-sm font-medium text-ink after:absolute after:-bottom-[22px] after:left-0 after:right-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-blue after:transition-transform after:duration-200 hover:text-blue hover:after:scale-x-100">
            Contact
          </ContactTrigger>
        </div>

        <div className="flex flex-none items-center gap-3.5">
          <ContactTrigger className="hidden text-[13px] text-steel min-[980px]:inline">
            +91 · South India
          </ContactTrigger>
        </div>
      </div>
    </nav>
  );
}
