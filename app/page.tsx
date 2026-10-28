import SiteScripts from "@/components/SiteScripts";
import { Sprite } from "@/components/icons";
import { Hero, Industries, Nav, Thesis } from "@/components/sections/Top";
import { Services } from "@/components/sections/Services";
import { Day, Race, Roi } from "@/components/sections/Middle";
import { Faq, Footer, Operators, Pricing, Process, Start } from "@/components/sections/Bottom";

export default function Home() {
  return (
    <>
      <Sprite />
      <div className="progress" aria-hidden="true"><span></span></div>
      <Nav />
      <main id="top">
        <Hero />
        <Industries />
        <Thesis />
        <Services />
        <Day />
        <Race />
        <Roi />
        <Process />
        <Operators />
        <Pricing />
        <Faq />
        <Start />
      </main>
      <Footer />
      <SiteScripts />
    </>
  );
}
