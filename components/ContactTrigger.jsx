"use client";

import { useContact } from "./ContactContext";

// Drop-in replacement for `<a href="/#contact">` / `<Link href="/#contact">`
// — same visual button, but opens the Contact modal instead of navigating to
// a section that doesn't exist on the page.
export default function ContactTrigger({ className, children, ...props }) {
  const { openContact } = useContact();
  return (
    <button type="button" className={className} onClick={openContact} {...props}>
      {children}
    </button>
  );
}
