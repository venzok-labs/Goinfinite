"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

// Single global source of truth for the Contact modal's open state, so any
// "Contact" link/button anywhere in the tree (Nav, Hero, PinnedStory,
// Services CTA, project CTA, the Services-page auto-open) can trigger the
// same modal instead of each owning its own copy.
const ContactContext = createContext(null);

export function ContactProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openContact = useCallback(() => setIsOpen(true), []);
  const closeContact = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, openContact, closeContact }), [isOpen, openContact, closeContact]);

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) {
    throw new Error("useContact must be used within a ContactProvider");
  }
  return ctx;
}
