"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, SplitText, CustomEase, ScrollTrigger);

// House easing — long, soft settle (matches --ease-out-expo in CSS).
CustomEase.create("weave", "0.16, 1, 0.3, 1");

export { gsap, SplitText, ScrollTrigger, useGSAP };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
