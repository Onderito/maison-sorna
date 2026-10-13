import type { Metadata } from "next";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Ressentir | SÖRNA",
};

export default function RessentirPage() {
  return (
    <>
      <main>
        <UniversHero
          id="la-maison"
          title={<>La maison</>}
          scrollTarget="#ressentir"
        >
          <Image
            src="/figma/ressentir/hero.png"
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
