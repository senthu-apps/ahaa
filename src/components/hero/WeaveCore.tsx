"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { LogoMark } from "@/components/brand/LogoMark";
import { INK, SIGNAL, makeDotSprite, makeMatcap } from "@/components/brand/weave3d";

/**
 * WeaveCore — a 5×5 plain weave rendered as line art:
 * white matcap threads with an inverted-hull ink outline, hovering over an
 * isometric slab with a dot-matrix face. Threads weave in on reveal; data
 * packets arriving from the circuit board run along a thread in orange.
 */

const N = 5; // threads per direction
const D = 0.4; // spacing between threads
const HALF = ((N - 1) / 2) * D;
const LEN = HALF + 0.24; // half-length of each thread
const AMP = 0.072; // over/under amplitude
const R = 0.045; // thread radius
const OUTLINE = 0.015;
const SEGS = 140;
const RADIAL = 12;
const IDX_PER_SEG = RADIAL * 6;

export const PACKET_EVENT = "weave:packet";

class WeaveCurve extends THREE.Curve<THREE.Vector3> {
  axis: "x" | "z";
  offset: number;
  phase: number;
  constructor(axis: "x" | "z", offset: number, phase: number) {
    super();
    this.axis = axis;
    this.offset = offset;
    this.phase = phase;
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const s = -LEN + t * 2 * LEN;
    // weft and warp are in antiphase at every crossing → true over/under
    const sign = this.axis === "x" ? 1 : -1;
    const y = sign * AMP * Math.cos((Math.PI * (s + HALF)) / D + Math.PI * this.phase);
    return this.axis === "x" ? target.set(s, y, this.offset) : target.set(this.offset, y, s);
  }
}

type Thread = {
  curve: WeaveCurve;
  body: THREE.Mesh;
  hull: THREE.Mesh;
  streak: THREE.Mesh;
  capA: THREE.Group;
  capB: THREE.Group;
  state: { p: number };
};

export function WeaveCore({ active }: { active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<() => void>(() => {});
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      // No WebGL — show the static mark instead.
      if (fallbackRef.current) fallbackRef.current.hidden = false;
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const FRUSTUM = 2.05;
    const camera = new THREE.OrthographicCamera(-FRUSTUM, FRUSTUM, FRUSTUM, -FRUSTUM, 0.1, 100);
    camera.position.set(10, 10, 10); // true isometric
    camera.lookAt(0, -0.18, 0);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

    const matcap = track(makeMatcap());
    const bodyMat = track(new THREE.MeshMatcapMaterial({ matcap }));
    const inkMat = track(new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }));
    const signalMat = track(new THREE.MeshBasicMaterial({ color: SIGNAL }));

    const timer = new THREE.Timer();
    const rig = new THREE.Group(); // parallax + idle sway
    scene.add(rig);

    // ---------- Slab ----------
    const slab = new THREE.Group();
    rig.add(slab);
    const SLAB = 2.36;
    const SLAB_T = 0.12;
    const SLAB_TOP = -0.3;
    const shape = new THREE.Shape();
    {
      const s = SLAB / 2;
      const r = 0.24;
      shape.moveTo(-s + r, -s);
      shape.lineTo(s - r, -s);
      shape.quadraticCurveTo(s, -s, s, -s + r);
      shape.lineTo(s, s - r);
      shape.quadraticCurveTo(s, s, s - r, s);
      shape.lineTo(-s + r, s);
      shape.quadraticCurveTo(-s, s, -s, s - r);
      shape.lineTo(-s, -s + r);
      shape.quadraticCurveTo(-s, -s, -s + r, -s);
    }
    const slabGeo = track(new THREE.ExtrudeGeometry(shape, { depth: SLAB_T, bevelEnabled: false, curveSegments: 10 }));
    slabGeo.rotateX(-Math.PI / 2);
    slabGeo.center();
    const slabMesh = new THREE.Mesh(slabGeo, bodyMat);
    const slabHull = new THREE.Mesh(slabGeo, inkMat);
    slabHull.scale.set((SLAB + OUTLINE * 2.2) / SLAB, (SLAB_T + OUTLINE * 2.2) / SLAB_T, (SLAB + OUTLINE * 2.2) / SLAB);
    slab.add(slabMesh, slabHull);
    slab.position.y = SLAB_TOP - SLAB_T / 2;

    // dot matrix on the slab face
    const DOTS = 12;
    const dotGap = (SLAB - 0.42) / (DOTS - 1);
    const dotPos = new Float32Array(DOTS * DOTS * 3);
    const dotCol = new Float32Array(DOTS * DOTS * 3);
    const level = new Float32Array(DOTS * DOTS);
    const idleCol = new THREE.Color("#cfcfd6");
    const hotCol = new THREE.Color("#f2541b");
    for (let i = 0; i < DOTS * DOTS; i++) {
      const gx = i % DOTS;
      const gz = Math.floor(i / DOTS);
      dotPos[i * 3] = -((DOTS - 1) * dotGap) / 2 + gx * dotGap;
      dotPos[i * 3 + 1] = SLAB_T / 2 + 0.004;
      dotPos[i * 3 + 2] = -((DOTS - 1) * dotGap) / 2 + gz * dotGap;
      idleCol.toArray(dotCol, i * 3);
    }
    const dotGeo = track(new THREE.BufferGeometry());
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
    dotGeo.setAttribute("color", new THREE.BufferAttribute(dotCol, 3));
    const dotTex = track(makeDotSprite());
    const dotMat = track(
      new THREE.PointsMaterial({
        size: 4.2 * Math.min(window.devicePixelRatio, 2),
        sizeAttenuation: false,
        vertexColors: true,
        map: dotTex,
        alphaTest: 0.5,
        transparent: false,
      }),
    );
    const dots = new THREE.Points(dotGeo, dotMat);
    slab.add(dots);

    // ---------- Threads ----------
    const weave = new THREE.Group();
    rig.add(weave);
    const capGeo = track(new THREE.SphereGeometry(R, 16, 12));
    const capHullGeo = track(new THREE.SphereGeometry(R + OUTLINE, 16, 12));

    const makeCap = () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(capGeo, bodyMat), new THREE.Mesh(capHullGeo, inkMat));
      g.visible = false;
      return g;
    };

    const threads: Thread[] = [];
    for (const axis of ["x", "z"] as const) {
      for (let i = 0; i < N; i++) {
        const curve = new WeaveCurve(axis, -HALF + i * D, i);
        const bodyGeo = track(new THREE.TubeGeometry(curve, SEGS, R, RADIAL, false));
        const hullGeo = track(new THREE.TubeGeometry(curve, SEGS, R + OUTLINE, RADIAL, false));
        const streakGeo = track(new THREE.TubeGeometry(curve, SEGS, R * 1.14, RADIAL, false));
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        const hull = new THREE.Mesh(hullGeo, inkMat);
        const streak = new THREE.Mesh(streakGeo, signalMat);
        streak.visible = false;
        const capA = makeCap();
        const capB = makeCap();
        capA.position.copy(curve.getPointAt(0));
        weave.add(body, hull, streak, capA, capB);
        threads.push({ curve, body, hull, streak, capA, capB, state: { p: 0 } });
      }
    }

    const applyProgress = (t: Thread) => {
      const p = t.state.p;
      const count = Math.floor(p * SEGS) * IDX_PER_SEG;
      t.body.geometry.setDrawRange(0, count);
      t.hull.geometry.setDrawRange(0, count);
      t.capA.visible = p > 0.002;
      t.capB.visible = p > 0.002;
      t.capB.position.copy(t.curve.getPointAt(Math.min(1, Math.floor(p * SEGS) / SEGS)));
    };

    // ---------- Packets (orange runs along a thread) ----------
    type Run = { thread: Thread; t0: number; dur: number };
    const runs: Run[] = [];
    const WIN = 0.24;
    const spawnRun = (now: number) => {
      const free = threads.filter((t) => t.state.p >= 1 && !runs.some((r) => r.thread === t));
      if (!free.length || runs.length >= 3) return;
      const thread = free[Math.floor(Math.random() * free.length)];
      thread.streak.visible = true;
      runs.push({ thread, t0: now, dur: 1.1 + Math.random() * 0.5 });
    };
    const updateRuns = (now: number) => {
      for (let i = runs.length - 1; i >= 0; i--) {
        const r = runs[i];
        const u = (now - r.t0) / r.dur; // 0 → 1
        const head = -WIN + u * (1 + WIN);
        const a = Math.max(0, Math.floor(head * SEGS));
        const b = Math.min(SEGS, Math.floor((head + WIN) * SEGS));
        if (u >= 1 || b <= a) {
          if (u >= 1) {
            r.thread.streak.visible = false;
            runs.splice(i, 1);
          }
          continue;
        }
        r.thread.streak.geometry.setDrawRange(a * IDX_PER_SEG, (b - a) * IDX_PER_SEG);
      }
    };
    const onPacket = () => spawnRun(timer.getElapsed());
    window.addEventListener(PACKET_EVENT, onPacket);

    // ---------- Intro (GSAP) ----------
    slab.scale.setScalar(0.001);
    dotMat.opacity = 1;
    let introDone = false;
    const intro = gsap.timeline({ paused: true, onComplete: () => void (introDone = true) });
    intro.to(slab.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.4)" }, 0);
    threads.forEach((t, k) => {
      const isWarp = k >= N;
      intro.to(
        t.state,
        {
          p: 1,
          duration: 0.95,
          ease: "power2.inOut",
          onUpdate: () => applyProgress(t),
        },
        0.35 + (isWarp ? 0.75 + (k - N) * 0.13 : k * 0.13),
      );
    });

    if (reduced) {
      slab.scale.setScalar(1);
      threads.forEach((t) => {
        t.state.p = 1;
        applyProgress(t);
      });
      introDone = true;
    }

    startRef.current = () => {
      if (!reduced) intro.play(0);
    };

    // ---------- Pointer parallax ----------
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    // ---------- Loop ----------
    let nextAmbient = 2.5;
    const tick = (time: number) => {
      timer.update(time);
      const now = timer.getElapsed();
      // idle sway + parallax
      const targetY = Math.sin(now * 0.35) * 0.12 + pointer.x * 0.22;
      const targetX = pointer.y * 0.06;
      rig.rotation.y += (targetY - rig.rotation.y) * 0.05;
      rig.rotation.x += (targetX - rig.rotation.x) * 0.05;
      weave.position.y = Math.sin(now * 1.1) * 0.03;

      if (introDone) {
        if (now > nextAmbient) {
          spawnRun(now);
          nextAmbient = now + 2.2 + Math.random() * 2.8;
        }
        updateRuns(now);
        // dot matrix twinkle
        if (Math.random() < 0.12) level[Math.floor(Math.random() * level.length)] = 1;
        for (let i = 0; i < level.length; i++) {
          if (level[i] <= 0.001) continue;
          level[i] *= 0.955;
          const l = level[i];
          dotCol[i * 3] = idleCol.r + (hotCol.r - idleCol.r) * l;
          dotCol[i * 3 + 1] = idleCol.g + (hotCol.g - idleCol.g) * l;
          dotCol[i * 3 + 2] = idleCol.b + (hotCol.b - idleCol.b) * l;
        }
        dotGeo.attributes.color.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };

    // ---------- Size + visibility ----------
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = -FRUSTUM * aspect;
      camera.right = FRUSTUM * aspect;
      camera.top = FRUSTUM;
      camera.bottom = -FRUSTUM;
      camera.updateProjectionMatrix();
      if (reduced) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let running = false;
    const setRunning = (on: boolean) => {
      if (reduced || on === running) return;
      running = on;
      renderer.setAnimationLoop(on ? tick : null);
    };
    const io = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting));
    io.observe(host);
    if (reduced) renderer.render(scene, camera);

    return () => {
      io.disconnect();
      ro.disconnect();
      renderer.setAnimationLoop(null);
      intro.kill();
      window.removeEventListener(PACKET_EVENT, onPacket);
      window.removeEventListener("pointermove", onPointer);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      startRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    if (active) startRef.current();
  }, [active]);

  return (
    <div ref={hostRef} className="h-full w-full">
      <div ref={fallbackRef} hidden className="grid h-full w-full place-items-center">
        <LogoMark size={88} ground="#f7f7f8" />
      </div>
    </div>
  );
}
