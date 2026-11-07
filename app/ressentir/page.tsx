import { pageMetadata } from "@/app/lib/seo/site";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import heroMedia from "@/components/hero-media.module.css";
import SiteFooter from "@/components/site-footer";
import OriginChapters from "./_components/origin-chapters";
import StoryIntroduction from "./_components/story-introduction";
import RegardSections from "./_components/regard-sections";
import AuthenticitySection from "./_components/authenticity-section";
import FoundersSection from "./_components/founders-section";
import ContributorsSection from "./_components/contributors-section";

export const metadata = pageMetadata("/ressentir", "La Maison, nos origines et nos convictions | SÖRNA", "De Sancerre aux monts Wuyi, découvrez les origines de SÖRNA, ses fondateurs et son regard sur le terroir, le thé et le soin.", "/figma/ressentir/hero-fenetre.png");

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
            src="/figma/ressentir/hero-fenetre.png"
            alt=""
            fill
            sizes="100vw"
            preload
            className={`object-cover ${heroMedia.house}`}
          />
        </UniversHero>
        <StoryIntroduction
          id="les-origines"
          imageSrc="/ressentir/introductions/nos-origines.png"
          title="Nos origines"
          subtitle="Un nom façonné par deux lieux, une influence, une même manière de regarder la matière."
        />
        <OriginChapters />
        <StoryIntroduction
          id="le-regard"
          imageSrc="/ressentir/introductions/notre-regard.png"
          title="Notre regard"
          subtitle="Grandir au milieu des vignes laisse des habitudes : goûter avant de juger, et ne jamais séparer un goût de son lieu."
        />
        <RegardSections />
        <AuthenticitySection />
        <StoryIntroduction
          id="a-l-origine-de-la-maison"
          imageSrc="/ressentir/introductions/origine-maison.png"
          title={["À l’origine de", "la Maison"]}
          subtitle="Deux parcours. L’un est venu par le goût du vin, l’autre par le travail de la vigne."
          multiline
        />
        <FoundersSection />
        <StoryIntroduction
          id="ceux-qui-l-accompagnent"
          imageSrc="/ressentir/introductions/ceux-accompagnent.png"
          title={["Ceux qui", "l’accompagnent"]}
          wideTitle
          subtitle="Une maison se construit aussi avec ceux qui lui donnent une voix, une image et une présence."
          multiline
        />
        <ContributorsSection />
      </main>
      <SiteFooter />
    </>
  );
}
