import ScrollImageIntroduction from "@/components/scroll-image-introduction";

export default function ProcessIntroduction() {
  return (
    <ScrollImageIntroduction id="le-geste" imageSrc="/figma/infuser/process/04.webp">
      <h2 id="le-geste-title" className="w-full font-display text-[length:var(--section-title-mobile-media)] md:text-[clamp(3.5rem,11.57vw,12.5rem)] leading-[0.85] font-normal tracking-[-0.04em] whitespace-nowrap uppercase">
        Le geste
      </h2>
      <p className="mx-auto mt-6 max-w-[36em] px-5 font-sans text-[clamp(0.875rem,1.16vw,1.25rem)] leading-[1.4] font-normal">
        De la cueillette à la torréfaction, cinq gestes façonnent nos thés. Chaque cuvée les combine à sa façon, et c’est ce chemin qui la distingue.
      </p>
    </ScrollImageIntroduction>
  );
}
