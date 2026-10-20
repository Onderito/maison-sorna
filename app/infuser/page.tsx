import type { Metadata } from "next";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";
import FaqSection from "@/components/faq-section";
import PlantProcess from "./_components/plant-process";
import TeaCard from "./_components/tea-card";
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
          title={<>Les cinq<br />sommets</>}
          scrollTarget="#sourcil-dor"
        >
          <Image
            src="/figma/infuser/hero.png"
            alt=""
            fill
            sizes="100vw"
            preload
            className="object-cover"
          />
        </UniversHero>
        <TeaCard />
        <PlantProcess steps={processSteps} />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
