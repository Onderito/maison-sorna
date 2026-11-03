import { pageMetadata } from "@/app/lib/seo/site";
import HeroSection from "@/app/_components/hero-section";

export const metadata = pageMetadata("/", "SÖRNA | Thés de terroir et art du soin", "Découvrez les Cinq Sommets, cinq crus de thé purs, et l’univers de SÖRNA : le goût du terroir, la matière et l’attention portée aux gestes.", "/figma/infuser/hero-wuyi.png");

export default function Home() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
