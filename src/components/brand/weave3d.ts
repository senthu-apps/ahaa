import * as THREE from "three";

/**
 * Shared look for the Three.js weaves (hero WeaveCore):
 * white matcap threads with an inverted-hull ink outline, read as line art.
 */

export const INK = 0x1b1b21;
export const SIGNAL = 0xf2541b;

/** Stepped radial light — reads as cel-shaded line art rather than plastic. */
export function makeMatcap() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c9c9d1";
  g.fillRect(0, 0, size, size);
  const grad = g.createRadialGradient(size * 0.36, size * 0.3, 0, size * 0.5, size * 0.5, size * 0.5);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.55, "#ffffff");
  grad.addColorStop(0.58, "#f1f1f4");
  grad.addColorStop(0.82, "#e6e6eb");
  grad.addColorStop(0.86, "#d6d6dd");
  grad.addColorStop(1, "#cbcbd3");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Round sprite for dot-matrix points. */
export function makeDotSprite() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(c);
}
