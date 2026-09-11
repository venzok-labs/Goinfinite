"use client";

import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);

  // Below 980px the link row and Contact button used to just disappear with
  // no replacement — this menu is that replacement. Closing on route change
  // isn't wired separately: every link/button below calls setOpen(false)
  // itself, and Escape/outside-tap close it too.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-white-a backdrop-blur-[10px]">
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="Infinite Solutions — home" onClick={() => setOpen(false)}>
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

        {/* Hamburger / close — the only nav-row control visible below 980px. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          className="hidden h-10 w-10 flex-none items-center justify-center rounded-[8px] text-navy transition-colors hover:bg-tint max-[980px]:flex"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d={open ? "M5 5l12 12M17 5L5 17" : "M3 6h16M3 11h16M3 16h16"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Slide-down panel — same link list + Contact button as the desktop
          row, just stacked. Only ever mounted below 980px (the toggle button
          that drives `open` is itself hidden above that width). */}
      {open && (
        <div
          id="mobile-nav-panel"
          className="hidden max-[980px]:block border-t border-line bg-white"
        >
          <div className="wrap flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-3 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-tint hover:text-blue"
              >
                {l.label}
              </Link>
            ))}
            <ContactTrigger
              className="btn btn-primary mt-2 justify-center"
              onClick={() => setOpen(false)}
            >
              Contact
            </ContactTrigger>
          </div>
        </div>
      )}
    </nav>
  );
}
