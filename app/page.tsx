import HeroSection from "@/components/hero-section";
import RessentiHero from "@/components/ressenti-hero";
import RessentirSlider from "@/components/ressentir-slider";
import SiteNavigation from "@/components/site-navigation";

export default function Home() {
  return (
    <>
      <SiteNavigation />
      <main>
        <HeroSection />
        <RessentirSlider />
        <RessentiHero />
      </main>
    </>
  );
}
