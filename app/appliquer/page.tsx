import type { Metadata } from "next";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Appliquer | SÖRNA",
};

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
            src="/figma/appliquer/hero.png"
            alt=""
            fill
            sizes="100vw"
            preload
            className="object-cover"
          />
        </UniversHero>
      </main>
      <SiteFooter />
    </>
  );
}
