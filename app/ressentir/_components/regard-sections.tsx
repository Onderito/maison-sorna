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
    introduction: "En Chine, dans le nord du Fujian, le regard de la Maison rencontre un autre terroir. À Wuyishan, la roche, la parcelle et le lieu façonnent la feuille.",
    image: "/figma/ressentir/regard/le-the.png",
    leftTitle: "Le charme de la roche",
    leftText: <>Le massif donne au thé son <strong>yan yun</strong> : une minéralité sèche qui persiste en bouche. Chaque lieu imprime <strong>son caractère.</strong></>,
    rightTitle: "Une seule famille",
    rightText: <><strong>Cinq cuvées</strong>, une même récolte de printemps. Sans mélange <strong>ni arôme ajouté</strong>, ce que la feuille a reçu du sol, et rien d’autre.</>,
  },
  {
    id: "le-soin",
    title: "Le soin",
    introduction: "Du thé au soin, la même exigence demeure : comprendre chaque matière, préserver son rôle et ne garder que l’essentiel.",
    image: "/figma/ressentir/regard/le-soin.png",
    leftTitle: "Sans eau",
    leftText: <>Le thé rencontre l’huile de pépins de raisin et le bakuchiol dans des formules <strong>sans eau,</strong> sans parfum et <strong>sans conservateur.</strong></>,
    rightTitle: "Quatre soins",
    rightText: <><strong>Quatre formules</strong> pensées comme une série : peu d’ingrédients, chacun choisi pour une fonction <strong>précise.</strong></>,
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
