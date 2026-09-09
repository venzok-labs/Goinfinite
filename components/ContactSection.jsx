"use client";

import { useEffect, useId, useRef, useState } from "react";
import Reveal from "./Reveal";

const INDUSTRY_OPTIONS = ["Automotive", "Aerospace", "Medical", "Industrial", "Energy", "Other"];

const WHATSAPP_NUMBER = "919841861609"; // +91 98418 61609, no spaces/punctuation for wa.me
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}`;

const INITIAL_FORM = {
  name: "",
  company: "",
  email: "",
  phone: "",
  industries: [],
  requirement: "",
};

// Loose but real checks — just enough to catch obviously-malformed input
// before a request would ever be sent, not full RFC validation.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

export default function ContactSection() {
  const formIdBase = useId();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent | error
  const [submitError, setSubmitError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  function toggleIndustry(option) {
    setForm((f) => ({
      ...f,
      industries: f.industries.includes(option)
        ? f.industries.filter((i) => i !== option)
        : [...f.industries, option],
    }));
    if (errors.industries) setErrors((er) => ({ ...er, industries: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.company.trim()) next.company = "Enter your company.";
    if (!form.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Enter a phone number.";
    else if (!PHONE_RE.test(form.phone.trim())) next.phone = "Enter a valid phone number.";
    if (form.industries.length === 0) next.industries = "Select at least one industry.";
    if (!form.requirement.trim()) next.requirement = "Briefly describe your requirement.";
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setSubmitError(err.message || "Something went wrong. Please try again.");
    }
  }

  const fieldId = (name) => `${formIdBase}-${name}`;

  return (
    <section id="contact" className="bg-white">
      <div className="wrap grid grid-cols-[1.3fr_1fr] gap-16 max-[900px]:grid-cols-1 max-[900px]:gap-12">
        {/* ---------- LEFT: the enquiry form ---------- */}
        <Reveal>
          <div className="eyebrow">Get in touch</div>
          <h2 className="mt-2.5 text-[30px]">Send Us an Engineering Enquiry</h2>
          <p className="mt-3 max-w-[56ch] text-[15.5px] text-steel">
            Tell us about the part, problem or project — drawings and models help us respond with a
            useful answer faster.
          </p>

          {status === "sent" ? (
            <div
              role="status"
              className="mt-8 rounded-xl border border-line bg-tint p-6 text-[14.5px] text-ink"
            >
              <p className="font-semibold text-navy">Thanks — your enquiry is in.</p>
              <p className="mt-1.5 text-steel">
                We&apos;ll review the details and get back to you shortly. For anything urgent, message
                us directly on{" "}
                <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
                .
              </p>
            </div>
          ) : (
            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                <Field
                  id={fieldId("name")}
                  label="Name"
                  error={errors.name}
                >
                  <input
                    id={fieldId("name")}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? `${fieldId("name")}-error` : undefined}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field id={fieldId("company")} label="Company" error={errors.company}>
                  <input
                    id={fieldId("company")}
                    type="text"
                    name="company"
                    autoComplete="organization"
                    required
                    aria-invalid={!!errors.company}
                    aria-describedby={errors.company ? `${fieldId("company")}-error` : undefined}
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company"
                    className={inputClass(errors.company)}
                  />
                </Field>

                <Field id={fieldId("email")} label="Email" error={errors.email}>
                  <input
                    id={fieldId("email")}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? `${fieldId("email")}-error` : undefined}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={inputClass(errors.email)}
                  />
                </Field>

                <Field id={fieldId("phone")} label="Phone" error={errors.phone}>
                  <input
                    id={fieldId("phone")}
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? `${fieldId("phone")}-error` : undefined}
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className={inputClass(errors.phone)}
                  />
                </Field>
              </div>

              <Field id={fieldId("industry")} label="Industry" error={errors.industries}>
                <MultiSelect
                  id={fieldId("industry")}
                  options={INDUSTRY_OPTIONS}
                  selected={form.industries}
                  onToggle={toggleIndustry}
                  hasError={!!errors.industries}
                  placeholder="Select one or more industries"
                  errorId={errors.industries ? `${fieldId("industry")}-error` : undefined}
                />
              </Field>

              <Field id={fieldId("requirement")} label="Engineering Requirement" error={errors.requirement}>
                <textarea
                  id={fieldId("requirement")}
                  name="requirement"
                  required
                  rows={4}
                  aria-invalid={!!errors.requirement}
                  aria-describedby={errors.requirement ? `${fieldId("requirement")}-error` : undefined}
                  value={form.requirement}
                  onChange={handleChange}
                  placeholder="Briefly describe the part, problem, or project"
                  className={`${inputClass(errors.requirement)} resize-none`}
                />
              </Field>

              {status === "error" && (
                <p role="alert" className="text-[13.5px] text-[#c0392b]">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn btn-primary mt-2 justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send Enquiry →"}
              </button>
            </form>
          )}
        </Reveal>

        {/* ---------- RIGHT: contact info + WhatsApp CTA ---------- */}
        <Reveal>
          <div className="flex h-full flex-col rounded-2xl border border-line bg-tint p-8">
            <h3 className="text-[22px] text-navy">Reach Us</h3>

            <ul className="mt-6 flex flex-col gap-5">
              <ContactRow
                label="Address"
                value="Chennai, Tamil Nadu, India"
                icon={
                  <path
                    d="M12 21s7-6.1 7-11.5S15.9 3 12 3 5 4.6 5 9.5 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="var(--blue)"
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
                    stroke="var(--blue)"
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
                    stroke="var(--blue)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                }
              />
            </ul>

            <div className="mt-8 border-t border-line pt-6">
              <p className="text-[14.5px] text-steel">Prefer to chat now?</p>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-3 w-full justify-center bg-[#25d366] hover:bg-[#1ebe5b] hover:shadow-[0_6px_18px_-6px_rgba(37,211,102,0.55)]"
              >
                Message on WhatsApp →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function inputClass(hasError) {
  return `rounded-[7px] border-[1.5px] px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition-colors focus:border-blue ${
    hasError ? "border-[#c0392b]" : "border-line"
  }`;
}

// Custom checkbox-list dropdown — a plain <select> can't offer touch/click
// multi-select without the ctrl/cmd-click convention, which most visitors
// won't discover. Closes on outside click or Escape, like the site's other
// popovers (CapabilityWheel's detail card, ContactModal).
function MultiSelect({ id, options, selected, onToggle, hasError, placeholder, errorId }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const summary = selected.length === 0 ? placeholder : selected.join(", ");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={hasError}
        aria-describedby={errorId}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass(hasError)} flex w-full items-center justify-between gap-2 text-left ${
          selected.length === 0 ? "text-steel" : "text-ink"
        }`}
      >
        <span className="truncate">{summary}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={`flex-none transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1 1.5 6 6.5 11 1.5" stroke="var(--steel)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-10 mt-1.5 w-full rounded-[7px] border-[1.5px] border-line bg-white p-1.5 shadow-[0_16px_36px_-12px_rgba(11,42,74,0.25)]"
        >
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <li key={opt} role="option" aria-selected={checked}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-[5px] px-3 py-2 text-[14px] text-ink hover:bg-tint">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(opt)}
                    className="h-4 w-4 accent-blue"
                  />
                  {opt}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ id, label, error, children }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-[13.5px] font-medium text-ink">
      {label}
      {children}
      {error && (
        <span id={`${id}-error`} className="text-[12.5px] font-normal text-[#c0392b]">
          {error}
        </span>
      )}
    </label>
  );
}

function ContactRow({ label, value, href, icon }) {
  const content = (
    <>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line bg-white">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <span className="flex flex-col">
        <span className="text-[12px] uppercase tracking-[0.06em] text-steel">{label}</span>
        <span className="text-[14.5px] text-ink">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="group flex items-center gap-3 text-ink hover:text-blue">
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-3">{content}</div>
      )}
    </li>
  );
}
