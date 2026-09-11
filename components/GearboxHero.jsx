"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Procedurally-generated 3D gear cluster (gearbox-hero-package), adapted from
 * the vendor's full-viewport drop-in snippet into a component scoped to the
 * hero's own visual panel — sizing and pointer/wheel/touch interaction are
 * bound to this component's container instead of `window`, so dragging or
 * scroll-zooming the model doesn't hijack the rest of the page.
 *
 * Falls back to a static SVG gear glyph if WebGL isn't available.
 */
export default function GearboxHero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let renderer;
    let raf;
    let ro;
    let cleanupFns = [];
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      try {
        const THREE = await import("three");
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // --- 1. Scene setup (sized to the container, not the window) ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          0.1,
          100
        );
        camera.position.set(0, 1, 9);

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        // No shadow-catcher plane in this version (see below) — a soft
        // feathered contact-shadow texture stands in for it instead, so a
        // real-time shadow map has nothing to render onto.
        renderer.shadowMap.enabled = false;

        // --- 2. Parametric gear builder ---
        function createGearGeometry({ teeth, module, toothDepth, thickness, holeRadius }) {
          const pitchRadius = (module * teeth) / 2;
          const outerRadius = pitchRadius + toothDepth * 0.5;
          const rootRadius = pitchRadius - toothDepth * 0.5;
          const toothAngle = (Math.PI * 2) / teeth;
          const tipWidth = toothAngle * 0.28;
          const flankWidth = toothAngle * 0.12;

          const shape = new THREE.Shape();
          for (let i = 0; i < teeth; i++) {
            const a = i * toothAngle;
            const a0 = a - tipWidth;
            const a1 = a - flankWidth;
            const a2 = a + flankWidth;
            const a3 = a + tipWidth;

            const p0 = [Math.cos(a0) * rootRadius, Math.sin(a0) * rootRadius];
            const p1 = [Math.cos(a1) * outerRadius, Math.sin(a1) * outerRadius];
            const p2 = [Math.cos(a2) * outerRadius, Math.sin(a2) * outerRadius];
            const p3 = [Math.cos(a3) * rootRadius, Math.sin(a3) * rootRadius];

            if (i === 0) shape.moveTo(p0[0], p0[1]);
            else shape.lineTo(p0[0], p0[1]);
            shape.lineTo(p1[0], p1[1]);
            shape.lineTo(p2[0], p2[1]);
            shape.lineTo(p3[0], p3[1]);
          }
          shape.closePath();

          const hole = new THREE.Path();
          hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
          shape.holes.push(hole);

          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: thickness,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 2,
            curveSegments: 1,
          });
          geometry.center();
          return { geometry, pitchRadius };
        }

        // Bright silver/white look. Note: without an environment map, a very
        // high metalness renders almost black (metals have ~0 diffuse albedo —
        // their apparent color normally comes from reflecting their
        // environment). Keeping metalness moderate lets the light base color
        // itself show as diffuse, while clearcoat still gives a metallic sheen.
        function metalMaterial(color) {
          return new THREE.MeshPhysicalMaterial({
            color,
            roughness: 0.34,
            metalness: 0.35,
            clearcoat: 0.6,
            clearcoatRoughness: 0.18,
            reflectivity: 0.5,
          });
        }

        const MODULE = 0.22;
        const gearGroup = new THREE.Group();
        const disposables = [];

        const centerTeeth = 32;
        const centerGear = (() => {
          const { geometry, pitchRadius } = createGearGeometry({
            teeth: centerTeeth, module: MODULE, toothDepth: 0.22, thickness: 0.9, holeRadius: 0.5,
          });
          const material = metalMaterial(0xf3f5f8);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          gearGroup.add(mesh);
          disposables.push(geometry, material);
          return { mesh, pitchRadius, teeth: centerTeeth };
        })();

        const leftTeeth = 14;
        const leftGear = (() => {
          const { geometry, pitchRadius } = createGearGeometry({
            teeth: leftTeeth, module: MODULE, toothDepth: 0.22, thickness: 0.9, holeRadius: 0.25,
          });
          const material = metalMaterial(0xe6eaee);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const dist = centerGear.pitchRadius + pitchRadius;
          mesh.position.set(-dist, 0, 0);
          gearGroup.add(mesh);
          disposables.push(geometry, material);
          return { mesh, pitchRadius, teeth: leftTeeth };
        })();

        const rightTeeth = 20;
        const rightGear = (() => {
          const { geometry, pitchRadius } = createGearGeometry({
            teeth: rightTeeth, module: MODULE, toothDepth: 0.22, thickness: 0.9, holeRadius: 0.32,
          });
          const material = metalMaterial(0xedf0f3);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const dist = centerGear.pitchRadius + pitchRadius;
          mesh.position.set(dist * 0.55, -dist * 0.86, 0);
          gearGroup.add(mesh);
          disposables.push(geometry, material);
          return { mesh, pitchRadius, teeth: rightTeeth };
        })();

        const topTeeth = 12;
        const topGear = (() => {
          const { geometry, pitchRadius } = createGearGeometry({
            teeth: topTeeth, module: MODULE, toothDepth: 0.22, thickness: 0.9, holeRadius: 0.22,
          });
          const material = metalMaterial(0xe9edf0);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const dist = centerGear.pitchRadius + pitchRadius;
          mesh.position.set(dist * 0.3, dist * 0.95, 0);
          gearGroup.add(mesh);
          disposables.push(geometry, material);
          return { mesh, pitchRadius, teeth: topTeeth };
        })();

        function addHub(target, radius) {
          const geometry = new THREE.CylinderGeometry(radius, radius, 1.0, 24);
          const material = metalMaterial(0xc7ced4);
          const hub = new THREE.Mesh(geometry, material);
          hub.rotation.x = Math.PI / 2;
          hub.position.copy(target.mesh.position);
          hub.castShadow = true;
          gearGroup.add(hub);
          disposables.push(geometry, material);
        }
        addHub(centerGear, 0.55);
        addHub(leftGear, 0.3);
        addHub(rightGear, 0.36);
        addHub(topGear, 0.24);

        gearGroup.rotation.x = -0.35;
        gearGroup.rotation.y = 0.15;
        gearGroup.scale.setScalar(0.5);
        scene.add(gearGroup);

        // Ground the cluster with ONLY a soft radial contact-shadow — no
        // opaque platform disc. A solid disc always has a hard silhouette
        // edge and its own lit shading, which (regardless of color) reads as
        // a separate card the moment the camera zooms in or tilts to a
        // grazing angle. A shadow that fades all the way to fully transparent
        // has no boundary for the eye to catch on, at any zoom level.
        const shadowCanvas = document.createElement("canvas");
        shadowCanvas.width = shadowCanvas.height = 256;
        const sctx = shadowCanvas.getContext("2d");
        const grad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, "rgba(6,20,38,0.32)");
        grad.addColorStop(0.45, "rgba(6,20,38,0.14)");
        grad.addColorStop(0.75, "rgba(6,20,38,0.04)");
        grad.addColorStop(1, "rgba(6,20,38,0)");
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 256, 256);
        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

        const contactGeo = new THREE.CircleGeometry(3.6, 48);
        const contactMat = new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
        });
        const contactShadow = new THREE.Mesh(contactGeo, contactMat);
        contactShadow.rotation.x = -Math.PI / 2;
        contactShadow.position.y = -2.15;
        scene.add(contactShadow);
        disposables.push(contactGeo, contactMat, shadowTexture);

        // --- 3. Studio lighting — a silver/chrome object needs strong
        // specular contrast to still read as 3D against a solid blue panel ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.85));

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
        keyLight.position.set(5, 5, 4);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x2c6fd6, 1.4);
        rimLight.position.set(-5, 3, -4);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
        fillLight.position.set(-3, -2, 2);
        scene.add(fillLight);

        // --- 4. Zoom & orbit controls — scoped to the canvas, not window,
        // so wheel/touch here never hijacks scrolling elsewhere on the page ---
        let targetZ = 9;
        // Tightened from 5 → 7: the closer end of the old range let the
        // camera get to a grazing, edge-on angle where individual gear teeth
        // read as disconnected slabs rather than one solid object.
        const minZ = 7;
        const maxZ = 13;

        function onWheel(e) {
          e.preventDefault();
          targetZ += e.deltaY * 0.005;
          targetZ = Math.min(Math.max(targetZ, minZ), maxZ);
        }
        canvas.addEventListener("wheel", onWheel, { passive: false });
        cleanupFns.push(() => canvas.removeEventListener("wheel", onWheel));

        let initialTouchDistance = 0;
        function onTouchStart(e) {
          if (e.touches.length === 2) {
            initialTouchDistance = Math.hypot(
              e.touches[0].pageX - e.touches[1].pageX,
              e.touches[0].pageY - e.touches[1].pageY
            );
          }
        }
        function onTouchMove(e) {
          if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = Math.hypot(
              e.touches[0].pageX - e.touches[1].pageX,
              e.touches[0].pageY - e.touches[1].pageY
            );
            const delta = initialTouchDistance - currentDistance;
            targetZ += delta * 0.01;
            targetZ = Math.min(Math.max(targetZ, minZ), maxZ);
            initialTouchDistance = currentDistance;
          }
        }
        canvas.addEventListener("touchstart", onTouchStart, { passive: true });
        canvas.addEventListener("touchmove", onTouchMove, { passive: false });
        cleanupFns.push(() => {
          canvas.removeEventListener("touchstart", onTouchStart);
          canvas.removeEventListener("touchmove", onTouchMove);
        });

        let orbitYaw = 0.15;
        let orbitPitch = -0.35;
        let dragVelYaw = 0;
        let dragVelPitch = 0;
        let isDragging = false;
        let idleSpin = true;
        let lastPointerX = 0;
        let lastPointerY = 0;

        const ROTATE_SPEED = 0.006;
        const PITCH_MIN = -1.3;
        const PITCH_MAX = 0.6;

        canvas.style.touchAction = "none";
        canvas.style.cursor = "grab";

        function onPointerDown(e) {
          isDragging = true;
          idleSpin = false;
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
          canvas.style.cursor = "grabbing";
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch (err) {
            /* no-op */
          }
        }
        function onPointerMove(e) {
          if (!isDragging) return;
          const dx = e.clientX - lastPointerX;
          const dy = e.clientY - lastPointerY;
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;

          dragVelYaw = dx * ROTATE_SPEED;
          dragVelPitch = dy * ROTATE_SPEED;

          orbitYaw += dragVelYaw;
          orbitPitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, orbitPitch + dragVelPitch));
        }
        function endDrag() {
          isDragging = false;
          canvas.style.cursor = "grab";
        }

        canvas.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);
        cleanupFns.push(() => {
          canvas.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", endDrag);
          window.removeEventListener("pointercancel", endDrag);
        });

        // --- 5. Animation loop — gear-ratio accurate meshing speeds ---
        const baseSpeed = 0.012;
        function animate() {
          raf = requestAnimationFrame(animate);

          if (!reduced) {
            centerGear.mesh.rotation.z += baseSpeed;
            leftGear.mesh.rotation.z -= baseSpeed * (centerGear.teeth / leftGear.teeth);
            rightGear.mesh.rotation.z -= baseSpeed * (centerGear.teeth / rightGear.teeth);
            topGear.mesh.rotation.z -= baseSpeed * (centerGear.teeth / topGear.teeth);
          }

          if (!isDragging) {
            if (idleSpin) {
              if (!reduced) orbitYaw += 0.002;
            } else {
              orbitYaw += dragVelYaw;
              orbitPitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, orbitPitch + dragVelPitch));
              dragVelYaw *= 0.92;
              dragVelPitch *= 0.92;
              if (Math.abs(dragVelYaw) < 0.0001 && Math.abs(dragVelPitch) < 0.0001) {
                idleSpin = true;
              }
            }
          }
          gearGroup.rotation.y = orbitYaw;
          gearGroup.rotation.x = orbitPitch;

          camera.position.z += (targetZ - camera.position.z) * 0.08;

          renderer.render(scene, camera);
        }
        animate();

        // --- 6. Responsive handling — observe the container, not window ---
        function resize() {
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (!w || !h) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        }
        if ("ResizeObserver" in window) {
          ro = new ResizeObserver(resize);
          ro.observe(container);
        } else {
          window.addEventListener("resize", resize);
          cleanupFns.push(() => window.removeEventListener("resize", resize));
        }

        cleanupFns.push(() => {
          disposables.forEach((d) => d.dispose && d.dispose());
        });
      } catch (err) {
        setFailed(true);
      }
    })();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      cleanupFns.forEach((fn) => fn());
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-full min-h-[420px] w-full max-w-[78%] max-[900px]:min-h-[300px] max-[900px]:max-w-full"
    >
      {/* `absolute inset-0` (not an in-flow `h-full w-full`) is load-bearing:
          this container's own height on desktop comes from the hero grid
          row's auto height, not a fixed value, so it isn't "definite" in CSS
          terms. An in-flow canvas with only a percentage height falls back
          to its *intrinsic* size instead — the width/height attributes
          `renderer.setSize` writes below, scaled by devicePixelRatio — which
          fed back into this container's own height. Every ResizeObserver
          firing (e.g. opening/closing DevTools) nudged that intrinsic size
          up, and the container grew a little more each time and never
          shrank back. Taking the canvas out of flow breaks the loop: it can
          never contribute to this container's height, only the reverse. */}
      {!failed && (
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full outline-none" />
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center opacity-90">
          <svg viewBox="0 0 200 200" width="200">
            <g fill="none" stroke="#076bdd" strokeWidth="6" opacity=".8">
              <circle cx="70" cy="90" r="34" />
              <circle cx="140" cy="70" r="22" />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
