import type { Metadata } from "next";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";
import OriginChapters from "./_components/origin-chapters";
import StoryIntroduction from "./_components/story-introduction";
import RegardSections from "./_components/regard-sections";
import AuthenticitySection from "./_components/authenticity-section";
import FoundersSection from "./_components/founders-section";
import ContributorsSection from "./_components/contributors-section";

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
          scrollTarget="#les-origines"
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
        <StoryIntroduction
          id="les-origines"
          title="Les origines"
          subtitle={
            <>
              Un nom façonné par trois lieux, trois influences,
              <br className="hidden sm:block" />{" "}
              une même manière de regarder la matière.
            </>
          }
        />
        <OriginChapters />
        <StoryIntroduction
          id="le-regard"
          title="Le regard"
          subtitle="Grandir dans une région de vin laisse des habitudes."
        />
        <RegardSections />
        <AuthenticitySection />
        <StoryIntroduction
          id="a-l-origine-de-la-maison"
          title={<>À l’origine de<br />la Maison</>}
          subtitle="Deux parcours liés à Sancerre, réunis autour d’une même manière de regarder et de faire."
          multiline
        />
        <FoundersSection />
        <StoryIntroduction
          id="ceux-qui-font-le-reste"
          title={<>Ceux qui font<br />le reste</>}
          subtitle={<>Parce qu’une Maison se construit aussi avec ceux qui lui<br className="hidden sm:block" />{" "}donnent une voix, une image et une présence.</>}
          multiline
        />
        <ContributorsSection />
      </main>
      <SiteFooter />
    </>
  );
}
