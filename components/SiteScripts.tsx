"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __ahaaInit?: boolean;
  }
}

export default function SiteScripts() {
  useEffect(() => {
    if (window.__ahaaInit) return;
    window.__ahaaInit = true;
    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/SplitText"),
      import("lenis"),
      import("@/lib/site"),
    ]).then(([g, st, sp, l, site]) => {
      site.initSite({
        gsap: g.gsap,
        ScrollTrigger: st.ScrollTrigger,
        SplitText: sp.SplitText,
        Lenis: l.default,
      });
    });
  }, []);

  return null;
}
