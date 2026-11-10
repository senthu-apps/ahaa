import { Hero } from "@/components/hero/Hero";
import { IndustryTicker } from "@/components/industries/IndustryTicker";
import { FixedPrice } from "@/components/pricing/FixedPrice";
import { WhatWeBuild } from "@/components/services/WhatWeBuild";
import { OrdinaryTuesday } from "@/components/day/OrdinaryTuesday";
import { HourlyVsFixed } from "@/components/compare/HourlyVsFixed";
import { CostCalculator } from "@/components/calculator/CostCalculator";
import { HowItWorks } from "@/components/process/HowItWorks";
import { WhoDoesTheWork } from "@/components/team/WhoDoesTheWork";
import { Rails } from "@/components/site/Rails";

export default function Home() {
  return (
    <main className="relative">
      {/* first child: every section paints above the rails */}
      <Rails />
      <Hero />
      <IndustryTicker />
      <FixedPrice />
      <WhatWeBuild />
      <OrdinaryTuesday />
      <HourlyVsFixed />
      <CostCalculator />
      <HowItWorks />
      <WhoDoesTheWork />
    </main>
  );
}
