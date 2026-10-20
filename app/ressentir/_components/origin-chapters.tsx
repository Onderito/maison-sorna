import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./origin-chapters.module.css";

type Chapter = {
  id: string;
  title: string;
  highlightedTitle: string;
  remainingTitle: string;
  introduction?: ReactNode;
  description?: ReactNode;
};

const chapters: Chapter[] = [
  {
    id: "sancerre",
    title: "Sancerre",
    highlightedTitle: "Sanc",
    remainingTitle: "erre",
    introduction: <>Sancerre a transmis à <strong>SÖRNA</strong> une conviction : un même produit change selon le lieu, la parcelle et le millésime.</>,
    description: <>C’est sur les coteaux de <strong>Sancerre</strong>, entre craie et silex, qu’est né un premier regard : celui qui apprend à lire un lieu, une parcelle et un <strong>millésime</strong> avant même de regarder le produit.</>,
  },
  {
    id: "ile",
    title: "L’Île",
    highlightedTitle: "L’Î",
    remainingTitle: "le",
    introduction: <>Le Nord apporte à <strong>SÖRNA</strong> une autre exigence : aller à l’essentiel, ne garder que ce qui sert, et laisser chaque chose trouver sa juste place.</>,
    description: <>Une recherche de simplicité qui ne retire rien, mais donne plus de valeur à ce qui reste. Une forme de retenue, calme et exigeante, qui façonne encore aujourd’hui la manière de faire de <strong>la Maison.</strong></>,
  },
  {
    id: "orna",
    title: "Orna",
    highlightedTitle: "Or",
    remainingTitle: "na",
    introduction: <>Du latin ornare, <strong>SÖRNA</strong> retient un geste : embellir sans masquer, révéler ce qui est déjà là plutôt que le transformer.</>,
    description: <>Ici, embellir ne signifie pas ajouter. C’est <strong>observer</strong> la matière, respecter ce qu’elle porte déjà et n’intervenir que pour mieux la révéler.</>,
  },
];

const photoRoot = "/figma/ressentir/histoire";

export default function OriginChapters() {
  return chapters.map((chapter, index) => (
    <section
      key={chapter.id}
      id={chapter.id}
      className={styles.chapter}
      aria-labelledby={`${chapter.id}-title`}
    >
      <h2 id={`${chapter.id}-title`} className={styles.title}>
        <span>{chapter.highlightedTitle}</span>{chapter.remainingTitle}
      </h2>
      <div className={`${styles.leftPhoto} image-grain`}>
        <Image src={`${photoRoot}/${chapter.id}-photo-gauche.png`} alt="" fill sizes="(max-width: 767px) 42vw, 20vw" className="object-cover" />
      </div>
      <div className={styles.introduction}>
        {chapter.introduction && <p>{chapter.introduction}</p>}
      </div>
      <div className={`${styles.panorama} image-grain`}>
        <Image src={`${photoRoot}/${chapter.id}-photo-panoramique.png`} alt="" fill sizes="(max-width: 767px) 100vw, 64vw" className="object-cover" />
      </div>
      <div className={styles.rightColumn}>
        <div className={`${styles.rightPhoto} image-grain`}>
          <Image src={`${photoRoot}/${chapter.id}-photo-droite.png`} alt="" fill sizes="(max-width: 767px) 48vw, 28vw" className="object-cover" />
        </div>
        {chapter.description && <p className={styles.description}>{chapter.description}</p>}
      </div>
      <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
    </section>
  ));
}
