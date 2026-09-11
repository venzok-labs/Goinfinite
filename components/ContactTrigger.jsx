"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Drop-in replacement for a plain <a href="/#contact"> — same visual
// button/link, but as a shared component so every "Contact"/"Discuss Your
// Project" call site stays in sync. Navigates (or scrolls, if already on
// the home page) to the ContactSection at the bottom of the page instead of
// opening a popup modal.
//
// Next's <Link> won't scroll to an in-page hash when the destination path
// is the same as the current one (a same-route "navigation" is a no-op, so
// the browser's native hash-scroll never fires) — clicking this from the
// home page updated the URL to "/#contact" but left the scroll position
// untouched. Scroll manually whenever we're already on "/".
export default function ContactTrigger({ className, children, ...props }) {
  const pathname = usePathname();

  function handleClick(e) {
    if (pathname === "/") {
      const el = document.getElementById("contact");
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", "/#contact");
      }
    }
  }

  return (
    <Link href="/#contact" className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
