"use client";

import { useEffect, useRef, useState } from "react";

const CATS = [
  {
    key: "cad",
    label: "CAD",
    detail:
      "AutoCAD, Creo and SolidWorks — used for concept development, 3D modelling, detailed engineering design and manufacturing-ready drawings.",
  },
  {
    key: "cae",
    label: "CAE",
    detail:
      "FEA and CFD — used for structural analysis, performance simulation, design validation and engineering optimisation.",
  },
  {
    key: "measurement",
    label: "Measurement",
    detail:
      "3D Measurement, Portable CMM and Laser Scanning — used to capture accurate dimensional data, verify geometry and support quality inspection.",
  },
  {
    key: "reverse",
    label: "Reverse Engineering",
    detail:
      "3D Scanning, Scan-to-CAD and Dimensional Inspection — used to capture existing components, recreate accurate models and verify critical dimensions.",
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    detail:
      "Engineering Drawings, Tooling and Fixtures — used to develop production-ready designs, support manufacturing and improve process accuracy.",
  },
  {
    key: "automation",
    label: "Automation",
    detail:
      "Mechanical, Electrical, Electronics and PLC Programming — used to develop reliable automation systems, machine controls and integrated solutions.",
  },
];

/*
 * Real 3D spinning capability wheel (capability-wheel-3d package), adapted
 * from the vendor's standalone <script> snippet into a React component —
 * uses the `three` package already in this project instead of a second CDN
 * <script> tag, and the click-to-detail modal is now React state instead of
 * direct DOM manipulation.
 */
export default function CapabilityWheel() {
  const stageRef = useRef(null);
  const popoverRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(null); // selected category, or null
  const [visible, setVisible] = useState(false); // drives the entrance transition

  useEffect(() => {
    let renderer;
    let raf;
    let resizeHandler;
    let cleanupFns = [];
    // React 18 dev-mode double-invokes this effect (mount → cleanup → mount
    // again) to surface exactly this kind of bug. `await import("three")`
    // means the first mount's cleanup can fire BEFORE its own setup has
    // gotten far enough to create anything — so `cancelled` has to be
    // checked after every await, or the first run finishes late and leaves
    // its canvas behind alongside the second run's.
    let cancelled = false;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      try {
        const THREE = await import("three");
        if (cancelled) return;
        const stage = stageRef.current;
        if (!stage) return;

        const N = CATS.length;
        const INNER_R = 0.55;
        const OUTER_R = 3.15;
        const THICKNESS = 0.5;
        const SKEW = (26 * Math.PI) / 180;
        const LABEL_R = (INNER_R + OUTER_R) / 2 + 0.15;
        const START_ANGLE = Math.PI / 2;
        const half = Math.PI / N;

        const COLOR_TOP = new THREE.Color("#66b2ff");
        const COLOR_BOTTOM = new THREE.Color("#0b4a8f");

        function pt(r, a) {
          return { x: r * Math.cos(a), y: r * Math.sin(a) };
        }

        function makeLabelTexture(text) {
          // 2x the resolution used before (1024x512, was 512x256) — at the
          // old size the texture was being stretched across a plane wide
          // enough that individual letters blurred/aliased, which read as
          // "text not visible" rather than just soft-looking.
          const canvas = document.createElement("canvas");
          canvas.width = 1024;
          canvas.height = 512;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const words = text.split(" ");
          ctx.font = '700 124px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
          // A dark outline behind the white fill keeps the label legible
          // regardless of which wedge colour (light or dark blue) sits
          // behind it — plain white-on-light-blue was the low-contrast spot.
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeStyle = "rgba(6,20,38,0.55)";
          ctx.lineWidth = 10;
          ctx.fillStyle = "#ffffff";
          function drawLine(line, y) {
            ctx.strokeText(line, canvas.width / 2, y);
            ctx.fillText(line, canvas.width / 2, y);
          }
          if (words.length > 1) {
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = words.slice(mid).join(" ");
            drawLine(line1, canvas.height / 2 - 76);
            drawLine(line2, canvas.height / 2 + 76);
          } else {
            drawLine(text, canvas.height / 2);
          }
          const tex = new THREE.CanvasTexture(canvas);
          tex.anisotropy = 8;
          tex.needsUpdate = true;
          return tex;
        }

        function buildWedgeShape(aB, aC, aA, aD) {
          const A = pt(INNER_R, aA);
          const B = pt(OUTER_R, aB);
          const C = pt(OUTER_R, aC);
          const D = pt(INNER_R, aD);
          const shape = new THREE.Shape();
          shape.moveTo(A.x, A.y);
          shape.lineTo(B.x, B.y);
          shape.absarc(0, 0, OUTER_R, aB, aC, false);
          shape.lineTo(D.x, D.y);
          shape.lineTo(A.x, A.y);
          return shape;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 4.6, 12.5);
        camera.lookAt(0, -0.3, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        stage.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
        dirLight.position.set(3, 6, 6);
        scene.add(dirLight);
        const fillLight = new THREE.DirectionalLight(0xe6f1ff, 0.2);
        fillLight.position.set(-4, 2, -3);
        scene.add(fillLight);

        const tiltRig = new THREE.Group();
        tiltRig.rotation.x = -0.55;
        scene.add(tiltRig);

        const discGroup = new THREE.Group();
        tiltRig.add(discGroup);

        const wedgeMeshes = [];
        const labelPlanes = [];
        const disposables = [];

        CATS.forEach((cat, i) => {
          const center = START_ANGLE - i * (2 * half);
          const aB = center - half;
          const aC = center + half;
          const aA = aB + SKEW;
          const aD = aC + SKEW;

          const shape = buildWedgeShape(aB, aC, aA, aD);
          const geo = new THREE.ExtrudeGeometry(shape, {
            depth: THICKNESS,
            bevelEnabled: true,
            bevelThickness: 0.06,
            bevelSize: 0.06,
            bevelSegments: 2,
            curveSegments: 24,
          });
          const t = CATS.length > 1 ? i / (CATS.length - 1) : 0;
          const color = COLOR_TOP.clone().lerp(COLOR_BOTTOM, t);
          const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.userData.cat = cat;
          discGroup.add(mesh);
          wedgeMeshes.push(mesh);
          disposables.push(geo, mat);

          const lp = pt(LABEL_R, center);
          const labelTex = makeLabelTexture(cat.label);
          const labelMat = new THREE.MeshBasicMaterial({
            map: labelTex,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
          });
          const labelW = 1.7;
          const labelH = labelW * (256 / 512);
          const labelGeo = new THREE.PlaneGeometry(labelW, labelH);
          const labelPlane = new THREE.Mesh(labelGeo, labelMat);
          labelPlane.position.set(lp.x, lp.y, THICKNESS + 0.08);
          labelPlane.renderOrder = 10;
          discGroup.add(labelPlane);
          labelPlanes.push(labelPlane);
          disposables.push(labelGeo, labelMat, labelTex);
        });

        const hubGeo = new THREE.CylinderGeometry(INNER_R + 0.32, INNER_R + 0.32, THICKNESS + 0.5, 40);
        const hubMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.05 });
        const hub = new THREE.Mesh(hubGeo, hubMat);
        hub.rotation.x = Math.PI / 2;
        hub.position.z = THICKNESS / 2;
        hub.renderOrder = 5;
        discGroup.add(hub);
        disposables.push(hubGeo, hubMat);

        function resize() {
          const w = stage.clientWidth;
          const h = stage.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
        resize();
        resizeHandler = resize;
        window.addEventListener("resize", resizeHandler);

        const SPIN_SPEED = (2 * Math.PI) / 90;
        let paused = false;

        // ---- drag-to-rotate by hand, with momentum ----
        // idleSpin: true = steady auto-spin. false while actively dragging
        // OR while a drag's momentum is still decaying back toward zero.
        let idleSpin = true;
        let isDragging = false;
        let dragVel = 0;
        let lastPointerX = 0;
        let downX = 0;
        let downY = 0;
        let moved = false;
        const ROTATE_SPEED = 0.012;
        const DRAG_MOVE_THRESHOLD = 4; // px — below this, treat as a click not a drag

        let lastT = performance.now();
        function animate(now) {
          raf = requestAnimationFrame(animate);
          const dt = Math.min((now - lastT) / 1000, 0.05);
          lastT = now;
          if (!paused && !reduced) {
            if (idleSpin) {
              discGroup.rotation.z += SPIN_SPEED * dt;
            } else if (!isDragging) {
              // momentum: keep spinning from the drag's last velocity,
              // decaying each frame, until it's negligible
              discGroup.rotation.z += dragVel;
              dragVel *= 0.92;
              if (Math.abs(dragVel) < 0.0001) idleSpin = true;
            }
          }
          const counter = -discGroup.rotation.z;
          labelPlanes.forEach((lp) => (lp.rotation.z = counter));
          renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(animate);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        function setPointerFromEvent(ev) {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        }
        function pickWedge(ev) {
          setPointerFromEvent(ev);
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(wedgeMeshes, false);
          return hits.length ? hits[0].object : null;
        }

        let hovered = null;
        function setHover(hit) {
          if (hit === hovered) return;
          if (hovered) hovered.material.emissive.setHex(0x000000);
          hovered = hit;
          if (hovered) hovered.material.emissive.setHex(0x0a2e5c);
          stage.classList.toggle("hoverable", !!hovered);
        }

        function onPointerDown(ev) {
          // starting a drag (rotating the wheel by hand) closes any open
          // popup instead of leaving it stranded while the wheel spins
          stage._cw3RequestClose?.();
          isDragging = true;
          idleSpin = false;
          moved = false;
          downX = ev.clientX;
          downY = ev.clientY;
          lastPointerX = ev.clientX;
          stage.classList.add("grabbing");
          try {
            renderer.domElement.setPointerCapture(ev.pointerId);
          } catch (err) {
            /* no-op */
          }
        }
        function onPointerMove(ev) {
          if (!isDragging) {
            if (ev.pointerType === "mouse") setHover(pickWedge(ev));
            return;
          }
          const dx = ev.clientX - lastPointerX;
          lastPointerX = ev.clientX;
          dragVel = dx * ROTATE_SPEED;
          discGroup.rotation.z += dragVel;
          if (Math.abs(ev.clientX - downX) + Math.abs(ev.clientY - downY) > DRAG_MOVE_THRESHOLD) {
            moved = true;
            setHover(null);
          }
        }
        function endDrag(ev) {
          if (!isDragging) return;
          isDragging = false;
          stage.classList.remove("grabbing");
          if (!moved) {
            // a tap/click, not a drag — open that segment's detail
            const hit = pickWedge(ev);
            if (hit) {
              paused = true;
              setActive(hit.userData.cat);
              return;
            }
          }
          // drag released with motion — let momentum in animate() carry it
        }
        function onPointerLeave() {
          if (!isDragging) setHover(null);
        }

        renderer.domElement.addEventListener("pointerdown", onPointerDown);
        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerleave", onPointerLeave);
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);
        cleanupFns.push(() => {
          renderer.domElement.removeEventListener("pointerdown", onPointerDown);
          renderer.domElement.removeEventListener("pointermove", onPointerMove);
          renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("pointerup", endDrag);
          window.removeEventListener("pointercancel", endDrag);
        });

        // exposed so closing the React modal can resume the spin
        stage._cw3Resume = () => {
          paused = false;
        };

        cleanupFns.push(() => {
          disposables.forEach((d) => d.dispose && d.dispose());
          // Without this, React 18 dev-mode's double-invoked effect (mount
          // → cleanup → mount again) leaves the FIRST renderer's <canvas>
          // sitting in the DOM forever alongside the second one — two
          // separate Three.js scenes both rendering into the same stage,
          // which is exactly what showed up as "two animations running."
          if (renderer.domElement.parentNode === stage) {
            stage.removeChild(renderer.domElement);
          }
        });
      } catch (err) {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      cleanupFns.forEach((fn) => fn());
      if (renderer) renderer.dispose();
    };
  }, []);

  function closeModal() {
    setVisible(false);
    setActive(null);
    stageRef.current?._cw3Resume?.();
  }

  // Let the wheel's drag-start request a close (see onPointerDown above).
  useEffect(() => {
    if (stageRef.current) stageRef.current._cw3RequestClose = closeModal;
  }, []);

  // Entrance animation: mount at scale/opacity 0, flip to visible a frame
  // later so the transition actually has something to animate from.
  useEffect(() => {
    if (!active) return;
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Close on: Escape, any click/tap outside the bubble, or scrolling the
  // page (the mobile case — there's no drag-to-rotate gesture to hook there,
  // so scroll is the equivalent "the visitor moved on" signal).
  useEffect(() => {
    if (!active) return;
    function onKey(ev) {
      if (ev.key === "Escape") closeModal();
    }
    function onPointerDownOutside(ev) {
      if (popoverRef.current && !popoverRef.current.contains(ev.target)) closeModal();
    }
    function onScroll() {
      closeModal();
    }
    document.addEventListener("keydown", onKey);
    // deferred so the click that opened this popup doesn't also close it
    const id = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDownOutside);
      window.addEventListener("scroll", onScroll, { passive: true });
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDownOutside);
      window.removeEventListener("scroll", onScroll);
    };
  }, [active]);

  if (failed) return null;

  return (
    <div className="flex flex-col items-center px-5 pt-6 pb-2">
      <div aria-hidden="true" className="relative z-[2] mb-2.5 flex flex-col items-center gap-2">
        <span className="absolute inset-0 animate-[cw3Pulse_1.6s_ease-out_infinite] rounded-full bg-blue motion-reduce:animate-none" />
        <span className="relative flex h-[34px] w-[34px] animate-[cw3Bounce_1.6s_ease-in-out_infinite] items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--blue),var(--panel-1))] shadow-[0_6px_16px_-6px_rgba(11,42,74,0.5)] motion-reduce:animate-none">
          <svg viewBox="0 0 20 20" width="16" height="16">
            <path
              d="M10 4 V14 M5 10 L10 15 L15 10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {/* Same hint-caption treatment (mono, uppercase, blue) used across
            every interactive section on the page, so they read as one
            family of "here's how to use this" affordances. */}
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-blue">
          Tap a segment
        </span>
      </div>
      {/* cursor/hover state here is toggled imperatively via classList from
          the Three.js pointer handlers above (outside React render), so
          `.cw-stage`/`.grabbing`/`.hoverable` stay plain CSS (globals.css)
          rather than conditional Tailwind classes. */}
      <div className="cw-stage relative aspect-square w-[min(520px,90vw)] cursor-grab touch-none" ref={stageRef} />

      {active && (
        <div
          ref={popoverRef}
          className={`fixed left-1/2 top-[46%] z-[200] w-[min(320px,calc(100vw-40px))] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-[#bcdcfa] bg-[#e3f2fd] p-[26px_24px_24px] text-center opacity-0 shadow-[0_20px_44px_-14px_rgba(11,42,74,0.35)] transition-[opacity,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            visible ? "scale-100 opacity-100" : "scale-[0.92]"
          }`}
          role="dialog"
          aria-modal="false"
          aria-labelledby="cw3-title"
        >
          <button
            className="absolute top-2 right-2.5 h-7 w-7 rounded-full border-0 bg-transparent text-xl leading-none text-[#5c85ab] hover:bg-[rgba(11,42,74,0.08)] hover:text-navy"
            aria-label="Close"
            onClick={closeModal}
          >
            ×
          </button>
          <h3 id="cw3-title" className="mb-2 text-[19px] text-navy">
            {active.label}
          </h3>
          <p className="text-[14.5px] leading-normal text-[#2c4f70]">{active.detail}</p>
          <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[0_0_4px_0] border-b border-r border-[#bcdcfa] bg-[#e3f2fd]" />
        </div>
      )}
    </div>
  );
}
