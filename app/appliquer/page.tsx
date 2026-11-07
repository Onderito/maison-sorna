import { pageMetadata } from "@/app/lib/seo/site";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import heroMedia from "@/components/hero-media.module.css";
import SiteFooter from "@/components/site-footer";

export const metadata = pageMetadata("/appliquer", "Appliquer, le second versant du soin | SÖRNA", "Découvrez le second versant de SÖRNA : une approche du soin attentive à la matière et aux gestes, dans le prolongement de notre regard sur le thé.", "/figma/appliquer/hero-soin.png");

export default function AppliquerPage() {
  return (
    <>
      <main>
        <UniversHero
          id="le-second-versant"
          title={
            <>
              Le second
              <br />
              versant
            </>
          }
          scrollTarget="#appliquer"
        >
          <Image
            src="/figma/appliquer/hero-soin.png"
            alt=""
            fill
            sizes="100vw"
            preload
            className={`object-cover ${heroMedia.care}`}
          />
        </UniversHero>
      </main>
      <SiteFooter />
    </>
  );
}
