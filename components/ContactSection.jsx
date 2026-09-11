"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";

const INDUSTRY_OPTIONS = [
  {
    key: "cad",
    name: "CAD & Product Design",
    detail: "AutoCAD, Creo, SolidWorks",
    icon: (
      <>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 3v9M12 12l8-4.5M12 12l-8-4.5M12 12v9" />
      </>
    ),
  },
  {
    key: "cae",
    name: "CAE & Simulation",
    detail: "FEA, CFD",
    icon: (
      <>
        <path d="M12 3v7" />
        <path d="M9 8l3 3 3-3" />
        <path d="M4 18q8 3 16 0" />
        <path d="M4 18l1.5-3M20 18l-1.5-3" />
      </>
    ),
  },
  {
    key: "measurement",
    name: "Measurement & Inspection",
    detail: "3D scanning, CMM, laser",
    icon: (
      <>
        <path d="M4 4v5h4" />
        <path d="M20 4v5h-4" />
        <path d="M4 4h16" />
        <circle cx="12" cy="15" r="4" />
        <path d="M8 9l1.5 3M16 9l-1.5 3" />
      </>
    ),
  },
  {
    key: "reverse",
    name: "Reverse Engineering",
    detail: "Scan-to-CAD, inspection",
    icon: (
      <>
        <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
        <rect x="8" y="8" width="8" height="8" rx="1" />
        <path d="M8 12h8" />
      </>
    ),
  },
  {
    key: "manufacturing",
    name: "Manufacturing Support",
    detail: "Drawings, tooling, fixtures",
    icon: (
      <>
        <path d="M3 20V11l5 3v-3l5 3v-3l5 3v6" />
        <path d="M3 20h18" />
        <path d="M6 20v-3M12 20v-3M18 20v-3" />
      </>
    ),
  },
  {
    key: "automation",
    name: "Automation & PLC",
    detail: "Mechanical, electrical, PLC",
    icon: (
      <>
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M7 9H4M7 12H4M7 15H4M20 9h-3M20 12h-3M20 15h-3" />
      </>
    ),
  },
  {
    key: "other",
    name: "Other / not sure yet",
    detail: "We'll help you scope it",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
        <path d="M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.4 1-1.4 2.1" />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

// Burst vectors (distance + direction) for the sparkles scattering out from
// the thanks-panel checkmark circle — see the sparkleBurst keyframes.
const SPARKLES = [
  { tx: "44px", ty: "12px", rot: "15deg", delay: "160ms", size: 16 },
  { tx: "10px", ty: "40px", rot: "75deg", delay: "230ms", size: 13 },
  { tx: "-35px", ty: "34px", rot: "135deg", delay: "300ms", size: 17 },
  { tx: "-40px", ty: "-16px", rot: "200deg", delay: "260ms", size: 14 },
  { tx: "-12px", ty: "-43px", rot: "255deg", delay: "340ms", size: 16 },
  { tx: "31px", ty: "-26px", rot: "320deg", delay: "190ms", size: 13 },
];

const STEP_LABELS = ["Requirement", "Contact", "Schedule"];
const STEP_TRANSLATE = { 1: "translate-x-0", 2: "-translate-x-1/3", 3: "-translate-x-2/3" };

const WHATSAPP_NUMBER = "919841861609"; // +91 98418 61609, no spaces/punctuation for wa.me
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}`;

// Toggle to bring back the "Reach Us" sidebar (address/phone/email/WhatsApp)
// next to the form — hidden for now so the enquiry wizard runs full width.
const SHOW_REACH_US = false;

// ⚠️ DEMO MODE — TEMPORARY, REMOVE BEFORE GOING LIVE ⚠️
// The Sheets webhook (SHEETS_WEBHOOK_URL, see app/api/contact/route.js and
// GOOGLE_SHEETS_SETUP.md) isn't configured yet, so a real submit currently
// fails with "Form isn't connected to a spreadsheet yet." Until that's set
// up, this short-circuits submitForm() to skip the real /api/contact call
// and always show the success screen, so the wizard can be demoed
// end-to-end. Flip this back to false (or just delete this block and the
// `if (DEMO_MODE) {...}` branch below) once the webhook is live — nothing
// else about the real submit path has been touched.
const DEMO_MODE = true;

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

// Call slots run 10:00 AM – 8:00 PM, 30 minutes each. Scheduling is a
// look-and-feel add-on: the chosen slot rides along in the success summary
// and the WhatsApp handoff message, but isn't sent to the Sheets API (see
// app/api/contact/route.js), which has no column for it.
const SLOT_START_MIN = 10 * 60;
const SLOT_END_MIN = 20 * 60;
const SLOT_TIMES = [];
for (let m = SLOT_START_MIN; m < SLOT_END_MIN; m += 30) SLOT_TIMES.push(m);

function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12 < 10 ? "0" + h12 : h12}:${m < 10 ? "0" + m : m} ${period}`;
}

export default function ContactSection() {
  const formIdBase = useId();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent | error
  const [submitError, setSubmitError] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [scheduled, setScheduled] = useState(false);

  // Set today's date client-side only, after mount, so the server-rendered
  // markup (which has no notion of "today") never mismatches on hydration.
  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // The three step panels sit side-by-side in one flex row, which (absent
  // measurement) stretches every panel to the height of the tallest one —
  // leaving a big empty gap under a short panel's content before the nav
  // buttons. Instead, measure the *current* panel and size the viewport to
  // just that, animating the height change along with the horizontal slide.
  const panelRefs = [useRef(null), useRef(null), useRef(null)];
  const [trackHeight, setTrackHeight] = useState(null);

  useLayoutEffect(() => {
    const el = panelRefs[step - 1]?.current;
    if (!el) return;
    setTrackHeight(el.offsetHeight);
  });

  useEffect(() => {
    function onResize() {
      const el = panelRefs[step - 1]?.current;
      if (el) setTrackHeight(el.offsetHeight);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step]);

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

  function validateStep2() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.company.trim()) next.company = "Enter your company.";
    if (!form.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Enter a phone number.";
    else if (!PHONE_RE.test(form.phone.trim())) next.phone = "Enter a valid phone number.";
    if (!form.requirement.trim()) next.requirement = "Briefly describe your requirement.";
    return next;
  }

  function goToContact() {
    if (form.industries.length === 0) {
      setErrors((er) => ({ ...er, industries: "Select at least one option." }));
      return;
    }
    setStep(2);
  }

  function goToSchedule() {
    const nextErrors = validateStep2();
    setErrors((er) => ({ ...er, ...nextErrors }));
    if (Object.keys(nextErrors).length > 0) return;
    setStep(3);
  }

  async function submitForm(withSchedule) {
    setScheduled(withSchedule);
    if (!withSchedule) setTime("");

    setStatus("submitting");
    setSubmitError("");

    // DEMO MODE — see the const above. Skips the real API call entirely so
    // the success screen can be demoed without a working Sheets webhook.
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 500)); // brief pause so "Submitting…" is visible
      setStatus("sent");
      return;
    }

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

  function handleRestart() {
    setStep(1);
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
    setSubmitError("");
    setDate(todayISO);
    setTime("");
    setScheduled(false);
  }

  const fieldId = (name) => `${formIdBase}-${name}`;
  const isToday = date === todayISO;
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const waText =
    `Hi, I'm ${form.name}. I just submitted an engineering enquiry` +
    (form.industries.length ? ` (${form.industries.join(", ")})` : "") +
    " on your website" +
    (scheduled && time ? ` and booked a call for ${date} at ${time}.` : ".");

  return (
    <section id="contact" className="scroll-mt-[92px] bg-white">
      <div className="wrap">
        {/* ---------- LEFT: the multi-step enquiry wizard ---------- */}
        <Reveal className="mx-auto max-w-[720px]">
          <div className="eyebrow">Get in touch</div>
          <h2 className="mt-2.5 text-[30px]">Send Us an Engineering Enquiry</h2>
          <p className="mt-3 max-w-[56ch] text-[15.5px] text-steel">
            Tell us about the part, problem or project — three quick steps: pick your industry, share
            your details, and optionally book a call with our engineering team.
          </p>

          {status === "sent" ? (
            <div className="mt-8 rounded-2xl border border-line bg-tint p-7 text-center">
              <div className="relative mx-auto h-14 w-14">
                {SPARKLES.map((s, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 text-blue motion-reduce:hidden animate-sparkle"
                    style={{ "--tx": s.tx, "--ty": s.ty, "--rot": s.rot, animationDelay: s.delay, width: s.size, height: s.size }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M12 0c.6 4.8 1.6 7.8 3 9.2C16.4 10.6 19.4 11.6 24 12c-4.6.4-7.6 1.4-9 2.8-1.4 1.4-2.4 4.4-3 9.2-.6-4.8-1.6-7.8-3-9.2C7.6 13.4 4.6 12.4 0 12c4.6-.4 7.6-1.4 9-2.8C10.4 7.8 11.4 4.8 12 0Z" />
                    </svg>
                  </span>
                ))}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-tint-2 animate-circle-pop motion-reduce:animate-none">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 12.5l5 5L20 6"
                      stroke="var(--blue)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="40"
                      strokeDashoffset="40"
                      className="animate-check-draw motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-lg font-semibold text-navy">
                Thanks, {form.name || "there"} — your enquiry is in.
              </p>
              <p className="mx-auto mt-1.5 max-w-[42ch] text-[14.5px] text-steel">
                {scheduled && time
                  ? "We've noted your requirement and your call slot. Our team will call you at the scheduled time."
                  : "We'll review the details and get back to you within one business day."}
              </p>

              {/* ---- premium "reach us" panel — the single WhatsApp CTA, pre-filled with this enquiry ---- */}
              <div className="mx-auto mt-6 max-w-[480px] rounded-[20px] bg-[linear-gradient(135deg,var(--panel-1),var(--panel-3))] p-7 text-left shadow-[0_24px_54px_-24px_rgba(11,42,74,0.6)] max-[480px]:rounded-2xl max-[480px]:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/12">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#3fe07a]" aria-hidden="true">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.3-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.37-.22.62-.13.25.09 1.6.76 1.87.9.28.14.46.21.53.32.07.12.07.68-.17 1.36Z" />
                    </svg>
                  </span>
                  <span className="eyebrow !text-[#8fb6f5]">Prefer to talk now?</span>
                </div>

                <h3 className="mt-3 text-[19px] text-white">Reach Us Directly</h3>
                <p className="mt-1.5 max-w-[38ch] text-[14px] leading-relaxed text-[#c7d8f0]">
                  Skip the wait — send our engineering team a quick DM on WhatsApp and someone will
                  get back to you shortly.
                </p>

                <ul className="mt-6 flex flex-col gap-4">
                  <PremiumReachRow
                    label="Address"
                    value="Chennai, Tamil Nadu, India"
                    icon={
                      <path
                        d="M12 21s7-6.1 7-11.5S15.9 3 12 3 5 4.6 5 9.5 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    }
                  />
                  <PremiumReachRow
                    label="Phone"
                    value="+91 98418 61609"
                    href="tel:+919841861609"
                    icon={
                      <path
                        d="M4 5c0-.6.4-1 1-1h2.4c.5 0 .9.3 1 .8l.9 3.4c.1.4 0 .8-.3 1.1L7.6 10.7a12 12 0 0 0 5.7 5.7l1.4-1.4c.3-.3.7-.4 1.1-.3l3.4.9c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1.5C9.9 20 4 14.1 4 6.5V5Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    }
                  />
                  <PremiumReachRow
                    label="Email"
                    value="raman.baskaran@goinfinite.in"
                    href="mailto:raman.baskaran@goinfinite.in"
                    icon={
                      <path
                        d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Zm1 0 7 5.5 7-5.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    }
                  />
                </ul>

                <a
                  href={`${WHATSAPP_HREF}?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn mt-7 w-full justify-center bg-[#25d366] text-[#06210E] hover:bg-[#1ebe5b] hover:shadow-[0_6px_18px_-6px_rgba(37,211,102,0.55)]"
                >
                  Message Us on WhatsApp →
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* ---- step indicator ---- */}
              <nav aria-label="Form progress" className="mt-8 flex items-start">
                {STEP_LABELS.map((label, i) => {
                  const n = i + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <div key={label} className="contents">
                      <div className="flex w-[84px] flex-none flex-col items-center gap-2">
                        <div
                          className={`mono flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-semibold transition-colors ${
                            done
                              ? "border-blue bg-blue text-white"
                              : active
                                ? "border-blue bg-tint-2 text-blue"
                                : "border-line bg-white text-steel"
                          }`}
                        >
                          {String(n).padStart(2, "0")}
                        </div>
                        <div className={`text-center text-[12px] font-medium ${active ? "text-ink" : "text-steel"}`}>
                          {label}
                        </div>
                      </div>
                      {n < STEP_LABELS.length && (
                        <div className="relative mt-4 h-0.5 flex-1 overflow-hidden bg-line">
                          <div
                            className={`absolute inset-0 origin-left bg-blue transition-transform duration-500 ease-out ${
                              step > n ? "scale-x-100" : "scale-x-0"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* ---- sliding card ---- */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_32px_-14px_rgba(11,42,74,0.18)]">
                <div
                  className="overflow-hidden transition-[height] duration-300 ease-out"
                  style={trackHeight ? { height: trackHeight } : undefined}
                >
                  <div
                    className={`flex w-[300%] items-start transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)] ${STEP_TRANSLATE[step]}`}
                  >
                    {/* PANEL 1 — Industry */}
                    <div ref={panelRefs[0]} className="w-1/3 shrink-0 p-7 max-[560px]:p-5">
                      <h3 className="text-[18px] font-semibold text-navy">What do you need help with?</h3>
                      <p className="mt-1 text-[13.5px] text-steel">Choose the area closest to your requirement.</p>

                      <div className="mt-4 grid grid-cols-2 gap-2.5 max-[480px]:grid-cols-1">
                        {INDUSTRY_OPTIONS.map((opt) => {
                          const selected = form.industries.includes(opt.name);
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => toggleIndustry(opt.name)}
                              className={`flex items-start gap-3 rounded-[10px] border-[1.5px] p-3.5 text-left transition-colors active:scale-[.99] ${
                                selected
                                  ? "border-blue bg-tint-2"
                                  : "border-line bg-white hover:border-blue/40 hover:bg-tint"
                              }`}
                            >
                              <span
                                className={`flex h-11 w-11 flex-none items-center justify-center rounded-[8px] ${
                                  selected ? "bg-blue text-white" : "bg-tint text-blue"
                                }`}
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  {opt.icon}
                                </svg>
                              </span>
                              <span>
                                <span className="block text-[14px] font-semibold leading-tight text-ink">
                                  {opt.name}
                                </span>
                                <span className="mt-0.5 block text-[12px] leading-snug text-steel">
                                  {opt.detail}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {errors.industries && (
                        <p className="mt-3 text-[12.5px] text-[#c0392b]">{errors.industries}</p>
                      )}
                    </div>

                    {/* PANEL 2 — Contact details */}
                    <div ref={panelRefs[1]} className="w-1/3 shrink-0 p-7 max-[560px]:p-5">
                      <h3 className="text-[18px] font-semibold text-navy">How can we reach you?</h3>
                      <p className="mt-1 text-[13.5px] text-steel">
                        We&apos;ll use these details to follow up on your requirement.
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                        <Field id={fieldId("name")} label="Name" error={errors.name}>
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

                      <div className="mt-4">
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
                      </div>
                    </div>

                    {/* PANEL 3 — Schedule a call */}
                    <div ref={panelRefs[2]} className="w-1/3 shrink-0 p-7 max-[560px]:p-5">
                      <h3 className="text-[18px] font-semibold text-navy">Schedule a call</h3>
                      <p className="mt-1 text-[13.5px] text-steel">
                        Optional — pick a date and time that suits you. Slots run 10:00&nbsp;AM–8:00&nbsp;PM,
                        30&nbsp;minutes each.
                      </p>

                      <div className="mt-5 max-w-[220px]">
                        <Field id={fieldId("date")} label="Date">
                          <input
                            id={fieldId("date")}
                            type="date"
                            min={todayISO}
                            value={date || todayISO}
                            onChange={(e) => {
                              setDate(e.target.value);
                              setTime("");
                            }}
                            className={inputClass(false)}
                          />
                        </Field>
                      </div>

                      <div className="mt-4">
                        <label className="block text-[13px] font-medium text-ink">Time slot</label>
                        <div className="mt-2 grid max-h-[230px] grid-cols-3 gap-2 overflow-y-auto pr-0.5 max-[480px]:grid-cols-2">
                          {SLOT_TIMES.map((m) => {
                            const label = formatMinutes(m);
                            const past = isToday && m <= nowMin + 30;
                            const selected = time === label;
                            return (
                              <button
                                key={m}
                                type="button"
                                disabled={past}
                                onClick={() => setTime(label)}
                                className={`mono rounded-[8px] border-[1.5px] px-1.5 py-2 text-center text-[12.5px] font-medium transition-colors ${
                                  past
                                    ? "cursor-not-allowed border-line text-steel/40 line-through"
                                    : selected
                                      ? "border-blue bg-blue text-white"
                                      : "border-line bg-white text-ink-2 hover:border-blue/40 hover:bg-tint"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {status === "error" && (
                        <p role="alert" className="mt-4 text-[13.5px] text-[#c0392b]">
                          {submitError}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-line pt-4">
                        <div className="text-[12.5px] text-steel">Not ready to talk yet? You can skip this step.</div>
                        <button
                          type="button"
                          onClick={() => submitForm(false)}
                          disabled={status === "submitting"}
                          className="cursor-pointer whitespace-nowrap text-[13px] font-semibold text-steel underline decoration-1 underline-offset-2 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Skip scheduling
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- nav row ---- */}
                {/* flex-wrap, plus each button going full-width below 380px:
                    the longest label here ("Schedule & submit →") doesn't
                    fit next to "Back" in the available width on a narrow
                    phone and was getting clipped at the viewport edge — below
                    380px the buttons stack full-width instead of overflowing. */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-tint px-7 py-4 max-[560px]:px-5">
                  {step === 1 && (
                    <>
                      <span />
                      <button
                        type="button"
                        onClick={goToContact}
                        disabled={form.industries.length === 0}
                        className="btn btn-primary max-[380px]:w-full max-[380px]:justify-center disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Continue →
                      </button>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-outline max-[380px]:w-full max-[380px]:justify-center"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={goToSchedule}
                        className="btn btn-primary max-[380px]:w-full max-[380px]:justify-center"
                      >
                        Continue →
                      </button>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={status === "submitting"}
                        className="btn btn-outline max-[380px]:w-full max-[380px]:justify-center disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => submitForm(!!time)}
                        disabled={status === "submitting"}
                        className="btn btn-primary max-[380px]:w-full max-[380px]:justify-center disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {status === "submitting" ? "Submitting…" : "Schedule & submit →"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </Reveal>

        {/* ---------- RIGHT: contact info + WhatsApp CTA ----------
             Hidden for now (SHOW_REACH_US) so the contact form runs full width;
             the markup is kept in place to switch back on easily. */}
        {SHOW_REACH_US && (
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
        )}
      </div>
    </section>
  );
}

function inputClass(hasError) {
  return `w-full rounded-[7px] border-[1.5px] px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition-colors focus:border-blue ${
    hasError ? "border-[#c0392b]" : "border-line"
  }`;
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

// Light-on-dark variant of ContactRow, for the premium "Reach Us" gradient
// panel on the thanks page — same shape, different (white-on-navy) palette.
function PremiumReachRow({ label, value, href, icon }) {
  const content = (
    <>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </span>
      <span className="flex flex-col">
        <span className="text-[11.5px] uppercase tracking-[0.06em] text-[#8fb6f5]">{label}</span>
        <span className="text-[14px] text-white">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="group flex items-center gap-3 transition-opacity hover:opacity-80">
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-3">{content}</div>
      )}
    </li>
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
