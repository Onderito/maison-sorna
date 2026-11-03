import Image from "next/image";
import ScrollImageIntroduction from "@/components/scroll-image-introduction";
import ProcessTransitions from "@/app/infuser/_components/process-transitions";
import styles from "./accord-section.module.css";

const accords = [
  { tea: "Pivoine Royale", title: "La fraîcheur de la mer", image: "pivoine-royale", alt: "Produits de la mer dans une assiette en céramique", text: "Pivoine Royale accompagne les produits de la mer, crus ou juste saisis. Son caractère délicat et floral prolonge l’accord avec légèreté, idéalement à l’apéritif ou en ouverture du repas." },
  { tea: "Brume des Cimes", title: "La précision du végétal", image: "brume-des-cimes", alt: "Poisson blanc et légumes verts dans une assiette claire", text: "Tendue et minérale, Brume des Cimes trouve son accord avec un poisson blanc aux saveurs épurées. Sa finale presque saline accompagne le plat avec précision et laisse le palais net." },
  { tea: "Écorce de Feu", title: "Les profondeurs du sous-bois", image: "ecorce-de-feu", alt: "Champignons dorés dans une assiette sombre", text: "Torréfié et boisé, Écorce de Feu trouve son accord avec les champignons et leurs notes profondes. Un cru de caractère, pensé pour accompagner les saveurs les plus intenses du repas." },
  { tea: "Miel d’Orchidée", title: "La douceur du fruit", image: "miel-d-orchidee", alt: "Poire dressée dans une assiette en céramique", text: "Rond et floral, Miel d’Orchidée trouve son accord avec la délicatesse des fruits blancs. Sa douceur naturelle accompagne le dessert avec finesse, sans en masquer les nuances." },
  { tea: "Sourcil d’Or", title: "La profondeur du dessert", image: "sourcil-d-or", alt: "Dessert au chocolat éclairé par le soleil", text: "Rond et sans amertume, Sourcil d’Or trouve son accord avec l’intensité d’un dessert au chocolat. Sa note de patate douce rôtie accompagne ses saveurs profondes et prolonge la fin du repas." },
] as const;

export default function AccordSection() {
  return <div className={styles.section}>
    <ScrollImageIntroduction id="l-art-de-l-accord" imageSrc="/recevoir/accords/pivoine-royale.png">
      <h2 id="l-art-de-l-accord-title" className={styles.title}>
        <span data-introduction-heading-mask><span data-introduction-heading>L’art de l’accord</span></span>
      </h2>
      <p data-introduction-copy className={styles.introductionCopy}>
        Un thé peut s’accorder à vos plats comme un vin. De l’apéritif au dessert, chaque cru accompagne une saveur, une texture, un moment du repas.
      </p>
    </ScrollImageIntroduction>
    <ProcessTransitions className={styles.panels}>
      {accords.map((accord, index) => <article key={accord.tea} className={styles.panel} data-process-panel data-process-stacked={index > 0 || undefined} style={{ zIndex: index + 1 }} aria-labelledby={`accord-${index}`}>
        <div className={styles.editorial}>
          <h3 id={`accord-${index}`} className={styles.chapter}>{accord.title}</h3>
          <div className={styles.center}>
            <div className={styles.thumbnail}><Image src={`/recevoir/accords/${accord.image}.png`} alt="" fill sizes="(max-width: 767px) 120px, 15vw" className={styles.image} /></div>
            <p>{accord.text}</p>
          </div>
          <p className={styles.caption}>{["I", "II", "III", "IV", "V"][index]} — {accord.tea}</p>
        </div>
        <div className={styles.scene}><Image src={`/recevoir/accords/${accord.image}.png`} alt={accord.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className={styles.image} /></div>
        <span className={styles.shade} data-process-shade aria-hidden="true" />
      </article>)}
    </ProcessTransitions>
  </div>;
}
