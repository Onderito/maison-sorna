import Image from "next/image";
import ScrollImageIntroduction from "@/components/scroll-image-introduction";
import ProcessTransitions from "@/app/infuser/_components/process-transitions";
import styles from "./accord-section.module.css";

const accords = [
  { tea: "Pivoine Royale", title: "La délicatesse végétale", image: "pivoine-royale", alt: "Produits de la mer dans une assiette en céramique", text: "Pivoine Royale révèle une fraîcheur végétale et un caractère délicat." },
  { tea: "Brume des Cimes", title: "La précision du végétal", image: "brume-des-cimes", alt: "Poisson blanc et légumes verts dans une assiette claire", text: "Tendue et minérale, Brume des Cimes dévoile une finale presque saline." },
  { tea: "Écorce de Feu", title: "Les profondeurs du sous-bois", image: "ecorce-de-feu", alt: "Champignons dorés dans une assiette sombre", text: "Torréfié et boisé, Écorce de Feu offre une expression profonde et affirmée." },
  { tea: "Miel d’Orchidée", title: "La douceur du fruit", image: "miel-d-orchidee", alt: "Poire dressée dans une assiette en céramique", text: "Rond et floral, Miel d’Orchidée séduit par sa douceur naturelle." },
  { tea: "Sourcil d’Or", title: "La rondeur du thé noir", image: "sourcil-d-or", alt: "Dessert au chocolat éclairé par le soleil", text: "Rond et sans amertume, Sourcil d’Or révèle une note de patate douce rôtie." },
] as const;

export default function AccordSection() {
  return <div className={styles.section}>
    <ScrollImageIntroduction id="l-art-de-l-accord" imageSrc="/recevoir/accords/pivoine-royale.png">
      <h2 id="l-art-de-l-accord-title" className={styles.title}>
        <span data-introduction-heading-mask><span data-introduction-heading>L’art de l’accord</span></span>
      </h2>
      <p data-introduction-copy className={styles.introductionCopy}>
        Nos crus s’infusent plusieurs fois. À chaque infusion, le thé évolue et révèle d’autres nuances. Un même cru peut ainsi accompagner toute une carte, de l’entrée au dessert.
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
