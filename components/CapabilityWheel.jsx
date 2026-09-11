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

const DEFAULT_TITLE = "Engineering Capabilities";
const DEFAULT_BODY =
  "Six core disciplines carry a project from first concept through to a working machine on the shop floor — design, simulation, measurement, reverse engineering, manufacturing support and automation, all under one roof.";
const REVERT_MS = 60000;

/*
 * Real 3D spinning capability wheel (capability-wheel-3d package), adapted
 * from the vendor's standalone <script> snippet into a React component —
 * uses the `three` package already in this project instead of a second CDN
 * <script> tag.
 *
 * Tapping a segment no longer opens a popup: it writes straight into the
 * right-side panel (title/body typed in character by character) and starts
 * a 60s auto-revert back to the default panel, restarted on every new tap.
 * All of that — including the typewriter — is done via direct DOM writes
 * through refs rather than React state, matching the rest of this file's
 * imperative style, and importantly so re-renders never interrupt the wheel:
 * the disc keeps spinning continuously, selection or not.
 */
export default function CapabilityWheel() {
  const stageRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const tagRef = useRef(null);
  const indexRef = useRef(null);
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const hintRef = useRef(null);
  const revertFillRef = useRef(null);
  const timerLabelRef = useRef(null);

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

    // ---- right panel: typewriter + auto-revert (refs only, no React state,
    // so typing a character never triggers a render and never touches the
    // wheel's own animation loop) ----
    const typeGen = { title: 0, body: 0 };
    let revertTimer = null;
    let tickInterval = null;
    let selectionToken = 0;

    function typeInto(el, text, speed, key) {
      if (!el) return;
      const myGen = ++typeGen[key];
      el.textContent = "";
      if (reduced) {
        el.textContent = text;
        return;
      }
      const caret = document.createElement("span");
      caret.className = "cw-caret";
      el.appendChild(caret);
      let i = 0;
      (function tick() {
        if (typeGen[key] !== myGen) return; // superseded by a newer call on this element
        if (i < text.length) {
          caret.insertAdjacentText("beforebegin", text[i]);
          i++;
          setTimeout(tick, speed);
        } else {
          caret.remove();
        }
      })();
    }

    function restartRevertBar() {
      const el = revertFillRef.current;
      if (!el) return;
      el.style.transition = "none";
      el.style.transform = "scaleX(1)";
      void el.offsetWidth; // force reflow so the transition below replays from scratch
      el.style.transition = `transform ${REVERT_MS}ms linear`;
      el.style.transform = "scaleX(0)";
    }

    cleanupFns.push(() => {
      if (revertTimer) clearTimeout(revertTimer);
      if (tickInterval) clearInterval(tickInterval);
      typeGen.title++;
      typeGen.body++;
    });

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

        // Brand primary / primary-dark tokens (see app/globals.css) — keeps the
        // disc in the official palette instead of a bespoke blue pair.
        const COLOR_TOP = new THREE.Color("#1877f2");
        const COLOR_BOTTOM = new THREE.Color("#0f4c81");
        const HOVER_EMISSIVE = 0x0a2e5c;
        const ACTIVE_EMISSIVE = 0x1d6fbf;

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
          mesh.userData.index = i;
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

        // ---- drag-to-rotate by hand, with momentum ----
        // idleSpin: true = steady auto-spin. false while actively dragging
        // OR while a drag's momentum is still decaying back toward zero.
        // Selecting a segment never touches any of this — the disc spins
        // continuously regardless of what's shown in the side panel.
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
          if (!reduced) {
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

        // A wedge's emissive glow now reflects two independent states —
        // hovered and actively-selected — so picking a segment doesn't get
        // silently erased the next time the pointer happens to leave it.
        let hovered = null;
        let activeMesh = null;
        function applyEmissive(mesh) {
          if (!mesh) return;
          if (mesh === activeMesh) mesh.material.emissive.setHex(ACTIVE_EMISSIVE);
          else if (mesh === hovered) mesh.material.emissive.setHex(HOVER_EMISSIVE);
          else mesh.material.emissive.setHex(0x000000);
        }
        function setHover(hit) {
          if (hit === hovered) return;
          const prev = hovered;
          hovered = hit;
          applyEmissive(prev);
          applyEmissive(hovered);
          stage.classList.toggle("hoverable", !!hovered);
        }
        function setActiveMesh(mesh) {
          const prev = activeMesh;
          activeMesh = mesh;
          applyEmissive(prev);
          applyEmissive(activeMesh);
        }

        function renderDefault() {
          const token = ++selectionToken;
          if (revertTimer) clearTimeout(revertTimer);
          if (tickInterval) clearInterval(tickInterval);
          setActiveMesh(null);
          if (tagRef.current) tagRef.current.textContent = "Overview";
          if (indexRef.current) indexRef.current.textContent = "";
          typeInto(titleRef.current, DEFAULT_TITLE, 22, "title");
          typeInto(bodyRef.current, DEFAULT_BODY, 10, "body");
          if (hintRef.current) hintRef.current.style.display = "flex";
          if (revertFillRef.current) {
            revertFillRef.current.style.transition = "none";
            revertFillRef.current.style.transform = "scaleX(1)";
          }
          if (timerLabelRef.current) {
            timerLabelRef.current.style.opacity = "0";
            timerLabelRef.current.textContent = "";
          }
          return token;
        }

        function selectCategory(cat, idx, mesh) {
          const token = ++selectionToken;
          if (revertTimer) clearTimeout(revertTimer);
          if (tickInterval) clearInterval(tickInterval);
          setActiveMesh(mesh);

          if (tagRef.current) tagRef.current.textContent = cat.label;
          if (indexRef.current) {
            indexRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(CATS.length).padStart(2, "0")}`;
          }
          typeInto(titleRef.current, cat.label, 26, "title");
          typeInto(bodyRef.current, cat.detail, 10, "body");
          if (hintRef.current) hintRef.current.style.display = "none";

          restartRevertBar();
          if (timerLabelRef.current) timerLabelRef.current.style.opacity = "1";

          let remaining = 60;
          const setLabel = () => {
            if (timerLabelRef.current) timerLabelRef.current.textContent = `auto-clears in ${remaining}s`;
          };
          setLabel();
          tickInterval = setInterval(() => {
            remaining -= 1;
            if (token !== selectionToken || remaining <= 0) {
              clearInterval(tickInterval);
              return;
            }
            setLabel();
          }, 1000);

          revertTimer = setTimeout(() => {
            if (token !== selectionToken) return;
            renderDefault();
          }, REVERT_MS);
        }

        function onPointerDown(ev) {
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
            // a tap/click, not a drag — show that segment's info in the panel
            const hit = pickWedge(ev);
            if (hit) selectCategory(hit.userData.cat, hit.userData.index, hit);
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

        // ---- keyboard access ----
        // The wedges themselves are WebGL/raycast targets, not real DOM
        // elements, so nothing about them was ever reachable without a mouse
        // or touch. `stage` carries tabIndex+role="listbox" in the JSX below
        // to make it a real stop in the tab order; Left/Right steps between
        // segments the same way the pointer tap does, Home/End jump to the
        // first/last, and Enter/Space re-confirms the current one (handy
        // after the panel's own 60s auto-revert).
        let kbIndex = 0;
        function onKeyDown(ev) {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Enter", " "].includes(ev.key)) {
            return;
          }
          ev.preventDefault();
          if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
            kbIndex = (kbIndex - 1 + N) % N;
          } else if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
            kbIndex = (kbIndex + 1) % N;
          } else if (ev.key === "Home") {
            kbIndex = 0;
          } else if (ev.key === "End") {
            kbIndex = N - 1;
          }
          // Enter/Space re-select the same index; the arrow-key branches
          // above already updated kbIndex before falling through to this.
          selectCategory(CATS[kbIndex], kbIndex, wedgeMeshes[kbIndex]);
        }
        stage.addEventListener("keydown", onKeyDown);
        cleanupFns.push(() => stage.removeEventListener("keydown", onKeyDown));

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

        renderDefault();
        if (!cancelled) setReady(true);
      } catch (err) {
        console.error("CapabilityWheel setup failed:", err);
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

  if (failed) return null;

  return (
    <div className="grid grid-cols-[minmax(280px,440px)_1fr] items-center gap-12 px-5 pt-6 pb-2 max-[900px]:grid-cols-1 max-[900px]:justify-items-center max-[900px]:gap-7">
      <div className="flex flex-col items-center gap-2">
        <div aria-hidden="true" className="relative z-[2] mb-1 flex flex-col items-center gap-2">
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
            rather than conditional Tailwind classes. tabIndex+role make it a
            real stop in the tab order — the wedges themselves are WebGL
            raycast targets, not DOM elements, so without this the wheel had
            no keyboard path at all (see the keydown handler above). */}
        <div
          className="cw-stage relative aspect-square w-[min(420px,90vw)] cursor-grab touch-none rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
          ref={stageRef}
          tabIndex={0}
          role="listbox"
          aria-label="Engineering capability categories — use the arrow keys to browse, Enter to select"
        >
          {!ready && !failed && (
            <div
              aria-hidden="true"
              className="absolute inset-[8%] animate-pulse rounded-full bg-tint-2 motion-reduce:animate-none"
            />
          )}
        </div>
      </div>

      <div className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-line bg-white p-[30px_32px_26px] shadow-[0_20px_44px_-28px_rgba(11,42,74,0.28)]">
        <div className="mb-3.5 flex items-center justify-between">
          <span ref={tagRef} className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-blue" />
          <span ref={indexRef} className="text-[11px] text-steel [font-variant-numeric:tabular-nums]" />
        </div>
        {/* aria-live so a screen-reader user hears the category change even
            though nothing here is a focus target itself — the typewriter
            effect mutates this DOM many times a second while typing, but
            screen readers coalesce rapid live-region changes and announce
            the settled text, so this doesn't turn into a firehose. */}
        <div aria-live="polite">
          <h3 ref={titleRef} className="mb-3 min-h-[29px] text-[22px] text-navy" />
          <p ref={bodyRef} className="min-h-[96px] text-[15px] leading-relaxed text-steel" />
        </div>
        <div ref={hintRef} className="mt-4 flex items-center gap-2 text-[12.5px] font-semibold text-blue">
          <span>→</span> Select a segment on the wheel to see its tools &amp; experience
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-line">
          <div
            ref={revertFillRef}
            className="h-full origin-left bg-[linear-gradient(90deg,var(--blue),var(--blue-dark))]"
            style={{ transform: "scaleX(1)" }}
          />
        </div>
        <span
          ref={timerLabelRef}
          className="pointer-events-none absolute right-3.5 bottom-2 text-[10px] text-steel opacity-0 transition-opacity duration-200 [font-variant-numeric:tabular-nums]"
        />
      </div>
    </div>
  );
}
