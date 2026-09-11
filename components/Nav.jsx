"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import ContactTrigger from "./ContactTrigger";

// `icon` is only used by the mobile card-style dropdown (see NavIcon below) —
// the desktop link row stays plain text with an underline hover, unchanged.
const LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/services", label: "Services", icon: "services" },
  { href: "/#capabilities", label: "Capabilities", icon: "capabilities" },
  { href: "/#industries", label: "Industries", icon: "industries" },
  { href: "/#about", label: "About", icon: "about" },
  { href: "/#projects", label: "Projects", icon: "projects" },
];

const ICON_PATHS = {
  home: "M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9",
  // Same gear glyph used for "Services" throughout the site (Industries'
  // Heavy Engineering icon) — keeps the two in visual sync.
  services:
    "M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0-4.9 1 2.1 2.2-.6 1.2 2 2.2.4-.1 2.3 1.9 1.3-1.2 2 .8 2.1-2.2.7-.2 2.3-2.2-.1-1.1 2-2-.9-2 .9-1.1-2-2.2.1-.2-2.3-2.2-.7.8-2.1-1.2-2 1.9-1.3-.1-2.3 2.2-.4 1.2-2 2.2.6 1-2.1Z",
  // A 2x2 grid of tiles reads as "several capabilities in one place" —
  // matches the CapabilityWheel section it links to.
  capabilities: "M4 4h6.5v6.5H4V4Zm9.5 0H20v6.5h-6.5V4ZM4 13.5h6.5V20H4v-6.5Zm9.5 0H20V20h-6.5v-6.5Z",
  industries:
    "M4 20V9l4.5 3V9l4.5 3V9l4.5 3v8H4Zm3-1v-3m4 3v-3m4 3v-3M8 6l1.2-2M12 6l1.2-2M16 6l1.2-2",
  about: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 11v5.5M12 7.7h.01",
  projects: "M4 7a1.2 1.2 0 0 1 1.2-1.2h3.6l1.8 1.8h8.2A1.2 1.2 0 0 1 20 8.8V17a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 17V7Z",
};

function NavIcon({ icon }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={ICON_PATHS[icon]}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    <>
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

        <ContactTrigger className="btn btn-primary flex-none max-[980px]:hidden">Contact</ContactTrigger>

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
    </nav>

    {/* Mobile menu — a floating "sheet" card (same idea as an iOS action
        sheet, just anchored under the top nav instead of the bottom of the
        screen): a dimmed scrim over the page, a rounded white card with its
        own title/close row, and a flat list of rows separated by hairline
        dividers instead of individually bordered/boxed links.
        Rendered as siblings of <nav>, not children of it: `<nav>` has
        `backdrop-blur`, and `backdrop-filter` establishes a new containing
        block for `position: fixed` descendants — a fixed scrim nested
        inside it was resolving its top/bottom against nav's own ~72px-tall
        box instead of the viewport, collapsing it to zero height and making
        it unclickable. Both pieces are `fixed` with an explicit top offset
        instead of `absolute`/`top-full` so they no longer depend on being
        inside nav's positioning context. Only ever mounted below 980px (the
        toggle button that drives `open` is itself hidden above that width). */}
    {open && (
      <>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-x-0 bottom-0 top-[72px] z-20 hidden bg-navy/45 backdrop-blur-[1px] max-[980px]:block"
        />
        <div
          id="mobile-nav-panel"
          className="fixed inset-x-0 top-[72px] z-30 hidden px-4 pt-3 max-[980px]:block"
        >
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-16px_rgba(11,42,74,0.45)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-display text-[17px] font-semibold text-navy">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-steel transition-colors hover:bg-tint hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col px-2 py-1.5">
              {LINKS.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-tint ${
                    i < LINKS.length - 1 ? "border-b border-line/70" : ""
                  }`}
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center text-blue">
                    <NavIcon icon={l.icon} />
                  </span>
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-line p-4">
              <ContactTrigger
                className="btn btn-primary w-full justify-center"
                onClick={() => setOpen(false)}
              >
                Contact
              </ContactTrigger>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
}
