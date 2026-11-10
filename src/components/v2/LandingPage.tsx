"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { Rails } from "@/components/site/Rails";
import { OrdinaryTuesday } from "@/components/day/OrdinaryTuesday";
import { Header } from "@/components/v2/sections/Header";
import { Hero } from "@/components/v2/sections/Hero";
import { Integrations } from "@/components/v2/sections/Integrations";
import { Services } from "@/components/v2/sections/Services";
import { UseCases } from "@/components/v2/sections/UseCases";
import { CaseStudies } from "@/components/v2/sections/CaseStudies";
import { Calculator } from "@/components/v2/sections/Calculator";
import { Process } from "@/components/v2/sections/Process";
import { Compare } from "@/components/v2/sections/Compare";
import { Plans } from "@/components/v2/sections/Plans";
import { Team } from "@/components/v2/sections/Team";
import { Security } from "@/components/v2/sections/Security";
import { Faq } from "@/components/v2/sections/Faq";
import { Book } from "@/components/v2/sections/Book";
import { Footer } from "@/components/v2/sections/Footer";

/** Case studies are hidden until the three studies arrive (user's call in review). */
const SHOW_CASE_STUDIES = false;

/**
 * The landing page, in the content doc's order (sections 1–15), as refined in
 * improvised-prototype/ (the review build this is ported from).
 * 12 · Industries is the live "An ordinary Tuesday" component, untouched.
 */
export function LandingPage() {
  // late layout shifts (web fonts, images) move every trigger below them
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <Header />
      <main id="main" className="relative">
        <Rails />
        <Hero />
        <Integrations />
        <Services />
        <UseCases />
        {/* 5 · Case studies: hidden for now (review, 2026-11-10) until the three studies are supplied.
            Restore here and in NAV / FOOTER.nav (src/content.ts). */}
        {SHOW_CASE_STUDIES && <CaseStudies />}
        <Calculator />
        <Process />
        <Compare />
        <Plans />
        <Team />
        <Security />
        <div id="industries">
          <OrdinaryTuesday />
        </div>
        <Faq />
        <Book />
      </main>
      <Footer />
    </>
  );
}
