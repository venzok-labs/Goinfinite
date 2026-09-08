"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollGear.module.css";

/*
 * A small companion version of the hero's wireframe model that appears
 * (fixed-position badge, bottom-right) only while `sectionRef`'s section is
 * on screen, and whose rotation is driven directly by scroll progress
 * through that section rather than auto-spinning on a timer — the same
 * wireframe motif from the hero, reused here to visually tie this section
 * back to it instead of feeling like a separate block.
 */
export default function ScrollGear({ sectionRef }) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => setActive(e.isIntersecting)),
      { rootMargin: "-10% 0px -10% 0px" }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [sectionRef]);

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
        const stage = canvas.parentElement;
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

        // Rotation is a pure function of how far scrolled through the
        // target section — no idle animation loop, no requestAnimationFrame
        // ticking in the background when nothing is changing.
        function updateFromScroll() {
          pendingRaf = null;
          const el = sectionRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const vh = window.innerHeight;
          const progress = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
          if (!reduced) {
            group.rotation.y = progress * Math.PI * 4;
            group.rotation.x = -0.3 + progress * 0.6;
            innerWire.rotation.y = -progress * Math.PI * 3;
          }
          render();
        }
        scrollHandler = () => {
          if (pendingRaf) return;
          pendingRaf = requestAnimationFrame(updateFromScroll);
        };
        window.addEventListener("scroll", scrollHandler, { passive: true });
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
  }, [sectionRef]);

  if (failed) return null;

  return (
    <div className={`${styles.badge} ${active ? styles.active : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
