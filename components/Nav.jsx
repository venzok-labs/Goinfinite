import Link from "next/link";
import Logo from "./Logo";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/#industries", label: "Industries" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#projects", label: "Projects" },
  { href: "/#insights", label: "Insights" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" aria-label="Infinite Solutions — home">
          <Logo size={32} />
        </Link>

        <div className={styles.links}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <a className={styles.tel} href="/#contact">
            +91 · South India
          </a>
        </div>
      </div>
    </nav>
  );
}
