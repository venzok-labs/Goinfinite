import Link from "next/link";
import Logo from "./Logo";
import ContactTrigger from "./ContactTrigger";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#industries", label: "Industries" },
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
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
        </div>

        <ContactTrigger className="btn btn-primary -ml-32 flex-none max-[980px]:hidden">Contact</ContactTrigger>
      </div>
    </nav>
  );
}
