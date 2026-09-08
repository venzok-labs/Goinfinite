"use client";

import { useEffect, useRef, useState } from "react";
import { useContact } from "./ContactContext";

const INITIAL_FORM = { name: "", email: "", phone: "", message: "" };

// Where the mailto: fallback below sends the enquiry. Swap for a real form
// endpoint (API route, Formspree, etc.) once one exists — see handleSubmit.
const CONTACT_EMAIL = "hello@infinitesolutions.example";

export default function ContactModal() {
  const { isOpen, closeContact } = useContact();
  const [form, setForm] = useState(INITIAL_FORM);
  const [sent, setSent] = useState(false);
  const dialogRef = useRef(null);

  // Escape-to-close + lock page scroll while the modal is up.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeContact();
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeContact]);

  // Reset to a clean form each time the modal is reopened.
  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // No backend wired up yet — hand the enquiry off to the visitor's mail
    // client. Replace this with a fetch() to a form/API endpoint later.
    const subject = encodeURIComponent(`Engineering enquiry from ${form.name || "website visitor"}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-5 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeContact();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        tabIndex={-1}
        className="reveal in max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-[34px] shadow-[0_28px_70px_-20px_rgba(11,42,74,0.55)] outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow text-[12px]">Get in touch</div>
            <h2 id="contact-modal-title" className="mt-2 text-2xl">
              Discuss Your Project
            </h2>
            <p className="mt-1.5 text-[14.5px] text-steel">
              Tell us about your requirement and we&apos;ll help identify the right approach.
            </p>
          </div>
          <button
            type="button"
            onClick={closeContact}
            aria-label="Close contact form"
            className="grid h-8 w-8 flex-none cursor-pointer place-items-center rounded-full text-lg text-steel transition-colors hover:bg-tint hover:text-ink"
          >
            ×
          </button>
        </div>

        {sent ? (
          <div className="mt-7 rounded-xl bg-tint p-5 text-[14.5px] text-ink">
            Thanks — your email client should have opened with your message ready to send. We&apos;ll
            get back to you shortly.
          </div>
        ) : (
          <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5 text-[13.5px] font-medium text-ink">
              Name
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="rounded-[7px] border-[1.5px] border-line px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition-colors focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13.5px] font-medium text-ink">
              Email
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="rounded-[7px] border-[1.5px] border-line px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition-colors focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13.5px] font-medium text-ink">
              Phone <span className="font-normal text-steel">(optional)</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 ..."
                className="rounded-[7px] border-[1.5px] border-line px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition-colors focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13.5px] font-medium text-ink">
              Project details
              <textarea
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us briefly about your requirement..."
                className="resize-none rounded-[7px] border-[1.5px] border-line px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition-colors focus:border-blue"
              />
            </label>

            <button type="submit" className="btn btn-primary mt-1.5 justify-center">
              Send Enquiry →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
