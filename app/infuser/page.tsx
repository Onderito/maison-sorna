import type { Metadata } from "next";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";
import FaqSection from "@/components/faq-section";
import PlantProcess from "./_components/plant-process";
import TeaCollection from "./_components/tea-collection";
import { processSteps } from "./process-steps";

export const metadata: Metadata = {
  title: "Infuser | SÖRNA",
};

export default function InfuserPage() {
  return (
    <>
      <main>
        <UniversHero
          id="la-carte"
          title={<>Les Cinq<br />Sommets</>}
          subtitle="Cinq cuvées de thé"
          scrollTarget="#les-cuvees"
        >
          <Image
            src="/figma/infuser/hero-wuyi.png"
            alt=""
            fill
            sizes="100vw"
            preload
            className="object-cover"
          />
        </UniversHero>
        <TeaCollection />
        <PlantProcess steps={processSteps} />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
