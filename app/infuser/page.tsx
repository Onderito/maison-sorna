import { pageMetadata } from "@/app/lib/seo/site";
import SeamlessBackgroundVideo from "@/components/seamless-background-video";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";
import FaqSection from "@/components/faq-section";
import PlantProcess from "./_components/plant-process";
import TeaCollection from "./_components/tea-collection";
import heroMedia from "@/components/hero-media.module.css";
import { processSteps } from "./process-steps";

export const metadata = pageMetadata("/infuser", "Les Cinq Sommets, cinq crus de thé | SÖRNA", "Explorez cinq crus de thé de Chine, leurs origines, leurs caractères et les gestes de préparation. Découvrez la collection Les Cinq Sommets de SÖRNA.", "/figma/infuser/hero-wuyi.png");

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
            className={`size-full ${heroMedia.infuser}`}
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
