"use client";

import { useEffect } from "react";
import { useContact } from "./ContactContext";

const STORAGE_KEY = "contact-modal-seen-services";

// Renders nothing — just pops the Contact modal open the first time a
// visitor lands on the Services page (reached from Nav "Services" or from
// any of the 6 "What We Do" cards on Home), then remembers it's been shown
// so returning visitors aren't nagged on every visit.
export default function ServicesContactAutoOpen() {
  const { openContact } = useContact();

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = window.localStorage.getItem(STORAGE_KEY) === "1";
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage unavailable (e.g. private browsing) — fall through and
      // just open it this time rather than blocking the modal entirely.
    }

    if (!alreadySeen) openContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
