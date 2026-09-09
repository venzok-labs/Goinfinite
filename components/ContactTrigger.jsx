import Link from "next/link";

// Drop-in replacement for a plain <a href="/#contact"> — same visual
// button/link, but as a shared component so every "Contact"/"Discuss Your
// Project" call site stays in sync. Navigates (or scrolls, if already on
// the home page) to the ContactSection at the bottom of the page instead of
// opening a popup modal.
export default function ContactTrigger({ className, children, ...props }) {
  return (
    <Link href="/#contact" className={className} {...props}>
      {children}
    </Link>
  );
}
