"use client";

import { useEffect } from "react";

// Browsers restore the visitor's previous scroll position on a plain
// reload by default (F5 while scrolled to About stays scrolled to About) —
// this turns that off and puts every reload back at the top of the page,
// the same as a first-ever visit. A URL with a hash (e.g. reloading while
// on /#contact) is left alone so that anchor jump still works.
export default function ScrollRestoration() {
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  return null;
}
