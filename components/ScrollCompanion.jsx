"use client";

import { useEffect, useRef, useState } from "react";

// Site-wide scroll companion: the same wireframe-globe badge on every page
// (mounted once in app/layout.jsx, so it persists across client-side
// navigation instead of re-initialising WebGL per page). Hidden at the very
// top and very bottom of the page, visible everywhere in between, with its
// rotation driven purely by scroll position — not an idle animation loop —
// so it stays in sync even when the page is entered already scrolled
// (a reload, an anchor jump) rather than only reacting to scroll events.
const TOP_THRESHOLD = 32;
const BOTTOM_THRESHOLD = 48;

export default function ScrollCompanion() {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let renderer;
    let pendingRaf;
    let scrollHandler;
    let resizeHandler;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      try {
        const THREE = await import("three");
        const canvas = canvasRef.current;
        const stage = canvas?.parentElement;
        if (!canvas || !stage) return;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.set(0, 0, 6.4);

        function size() {
          const w = stage.clientWidth;
          const h = stage.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
        size();
        resizeHandler = size;
        window.addEventListener("resize", resizeHandler);

        const group = new THREE.Group();
        scene.add(group);

        const icoGeo = new THREE.IcosahedronGeometry(1.85, 1);
        const wire = new THREE.LineSegments(
          new THREE.EdgesGeometry(icoGeo),
          new THREE.LineBasicMaterial({ color: 0x1d6fbf, transparent: true, opacity: 0.9 })
        );
        group.add(wire);

        const innerGeo = new THREE.IcosahedronGeometry(1.1, 0);
        const innerWire = new THREE.LineSegments(
          new THREE.EdgesGeometry(innerGeo),
          new THREE.LineBasicMaterial({ color: 0x8fc9ff, transparent: true, opacity: 0.55 })
        );
        group.add(innerWire);

        function render() {
          renderer.render(scene, camera);
        }
        render();

        function updateFromScroll() {
          pendingRaf = null;
          const doc = document.documentElement;
          const scrollable = doc.scrollHeight - window.innerHeight;
          const scrollY = window.scrollY;

          const show =
            scrollable > TOP_THRESHOLD + BOTTOM_THRESHOLD &&
            scrollY > TOP_THRESHOLD &&
            scrollY < scrollable - BOTTOM_THRESHOLD;
          setVisible(show);

          if (!reduced && scrollable > 0) {
            const progress = Math.min(1, Math.max(0, scrollY / scrollable));
            group.rotation.y = progress * Math.PI * 6;
            group.rotation.x = -0.3 + progress * 0.6;
            innerWire.rotation.y = -progress * Math.PI * 4.5;
            render();
          }
        }
        scrollHandler = () => {
          if (pendingRaf) return;
          pendingRaf = requestAnimationFrame(updateFromScroll);
        };
        window.addEventListener("scroll", scrollHandler, { passive: true });
        // Sync immediately on mount so a page entered mid-scroll (reload,
        // anchor link, back/forward navigation) shows the correct state
        // without waiting for the next scroll event.
        updateFromScroll();
      } catch (err) {
        setFailed(true);
      }
    })();

    return () => {
      if (pendingRaf) cancelAnimationFrame(pendingRaf);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (renderer) renderer.dispose();
    };
  }, []);

  if (failed) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed right-6 bottom-6 z-40 h-[72px] w-[72px] rounded-full border border-line bg-white shadow-[0_12px_28px_-12px_rgba(11,42,74,0.35)] opacity-0 motion-reduce:transition-none transition-[opacity,transform] duration-[450ms] ease-out max-[960px]:right-[18px] max-[960px]:bottom-[18px] max-[960px]:h-[60px] max-[960px]:w-[60px] max-[620px]:right-[14px] max-[620px]:bottom-[14px] max-[620px]:h-[50px] max-[620px]:w-[50px] ${
        visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-[14px] scale-[0.85]"
      }`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
