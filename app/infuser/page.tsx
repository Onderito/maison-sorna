import type { Metadata } from "next";
import SeamlessBackgroundVideo from "@/components/seamless-background-video";
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
          subtitle="Cinq crus de thé"
          scrollTarget="#les-cuvees"
        >
          <SeamlessBackgroundVideo
            src="/videos/infuser-tea-artisan.mp4"
            className="size-full"
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
