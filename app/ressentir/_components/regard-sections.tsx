import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./regard-sections.module.css";

type RegardSection = {
  id: string;
  title: string;
  introduction: string;
  image: string;
  leftTitle: string;
  leftText: ReactNode;
  rightTitle: string;
  rightText: ReactNode;
};

const sections: RegardSection[] = [
  {
    id: "le-the",
    title: "Le thé",
    introduction: "Ce regard s’est d’abord posé sur les monts Wuyi, au nord du Fujian, en Chine. Comme à Sancerre, la roche, l’altitude et l’exposition y façonnent la feuille, d’une parcelle à l’autre.",
    image: "/figma/ressentir/regard/le-the.png",
    leftTitle: "Le charme de la roche",
    leftText: <>Sur les oolongs de roche, le massif laisse une signature que l’on appelle là-bas <strong>yan yun</strong> : une minéralité qui persiste longtemps en bouche. Chaque falaise, chaque vallée imprime la sienne.</>,
    rightTitle: "Rien que la feuille",
    rightText: <><strong>Cinq cuvées</strong> cueillies au printemps, sans assemblage <strong>ni arôme ajouté.</strong> Dans la tasse, ce que la feuille a reçu de son sol et de ceux qui l’ont travaillée.</>,
  },
  {
    id: "le-soin",
    title: "Le soin",
    introduction: "Du thé au soin, la démarche ne change pas : connaître chaque matière, et ne l’employer que pour ce qu’elle apporte.",
    image: "/figma/ressentir/regard/le-soin.png",
    leftTitle: "Anhydre",
    leftText: <>Dans nos soins, le thé rencontre la vigne et le bakuchiol, un actif d’origine végétale. <strong>Sans eau</strong>, les formules n’ont pas besoin de conservateur. Elles sont aussi <strong>sans parfum.</strong></>,
    rightTitle: "Cinq soins",
    rightText: <><strong>Cinq formules</strong>, une gamme volontairement courte. Peu d’ingrédients, et pour chacun, une raison précise d’être là.</>,
  },
];

export default function RegardSections() {
  return sections.map((section) => (
    <section key={section.id} id={section.id} className={`${styles.section} ${section.id === "le-soin" ? styles.care : ""}`} aria-labelledby={`${section.id}-title`}>
      <header className={styles.header}>
        <h2 id={`${section.id}-title`} className={styles.title}>{section.title}</h2>
        <p className={styles.introduction}>{section.introduction}</p>
      </header>
      <div className={`${styles.photograph} image-grain`}>
        <Image src={section.image} alt="" fill sizes="(max-width: 767px) 100vw, 78vw" className={styles.image} />
      </div>
      <div className={styles.notes}>
        <div className={styles.note}>
          <h3>{section.leftTitle}</h3>
          <p>{section.leftText}</p>
        </div>
        <div className={styles.note}>
          <h3>{section.rightTitle}</h3>
          <p>{section.rightText}</p>
        </div>
      </div>
    </section>
  ));
}
