"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero3D.module.css";

// Rotating wireframe engineering model — stands in for a CAD/scan model in the hero.
// Falls back to a static SVG wireframe if WebGL isn't available.
export default function Hero3D() {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let renderer, raf, resizeHandler;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      try {
        const THREE = await import("three");
        const canvas = canvasRef.current;
        const stage = canvas.parentElement;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, stage.clientWidth / stage.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 6.4);

        function size() {
          const w = stage.clientWidth;
          const h = stage.clientHeight;
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

        const pts = [];
        const arr = icoGeo.attributes.position.array;
        for (let i = 0; i < arr.length; i += 3) {
          pts.push(new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2]));
        }
        const points = new THREE.Points(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.PointsMaterial({ color: 0x0b2a4a, size: 0.06 })
        );
        group.add(points);

        const clock = new THREE.Clock();
        function animate() {
          raf = requestAnimationFrame(animate);
          const dt = clock.getDelta();
          if (!reduced) {
            group.rotation.y += dt * 0.35;
            group.rotation.x += dt * 0.12;
            innerWire.rotation.y -= dt * 0.5;
          }
          renderer.render(scene, camera);
        }
        animate();
      } catch (err) {
        setFailed(true);
      }
    })();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div className={styles.stage}>
      {!failed && <canvas ref={canvasRef} />}
      {failed && (
        <div className={styles.fallback}>
          <svg viewBox="0 0 200 200" width="220">
            <g fill="none" stroke="#1d6fbf" strokeWidth="1.5" opacity=".8">
              <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" />
              <polygon points="100,20 100,180" />
              <polygon points="30,60 170,140" />
              <polygon points="170,60 30,140" />
            </g>
          </svg>
        </div>
      )}
      <div className={styles.cap}>Wireframe model · rotating render</div>
    </div>
  );
}
