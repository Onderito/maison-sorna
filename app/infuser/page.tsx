import type { Metadata } from "next";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import PlantProcess from "./_components/plant-process";
import { processSteps } from "./process-steps";

export const metadata: Metadata = {
  title: "Infuser | Maison Sörna",
};

export default function InfuserPage() {
  return (
    <main>
      <UniversHero
        id="les-cinq-sommets"
        title={
          <>
            Les cinq
            <br />
            sommets
          </>
        }
        scrollTarget="#infuser"
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
      <PlantProcess steps={processSteps} />
    </main>
  );
}
