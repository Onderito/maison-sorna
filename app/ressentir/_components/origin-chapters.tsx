import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./origin-chapters.module.css";

type Chapter = {
  id: string;
  title: string;
  label: string;
  highlightedTitle: string;
  remainingTitle: string;
  introduction?: ReactNode;
  description?: ReactNode;
};

const chapters: Chapter[] = [
  {
    id: "sancerre",
    title: "Sancerre",
    label: "S pour Sancerre",
    highlightedTitle: "Sanc",
    remainingTitle: "erre",
    introduction: <>Le S, c’est <strong>Sancerre</strong>. Le vignoble où le fondateur a grandi, et la terre où <strong>SÖRNA</strong> garde ses racines.</>,
    description: <>Sur ces coteaux, entre terres blanches, caillottes et silex, on apprend tôt qu’un même sauvignon ne donne jamais deux fois le même vin. La parcelle, le sol et l’année décident. C’est ce regard, tourné vers le lieu avant le produit, que <strong>SÖRNA</strong> porte sur chaque thé et chaque soin.</>,
  },
  {
    id: "ile",
    title: "L’Île",
    label: "Ö pour l’île",
    highlightedTitle: "L’Î",
    remainingTitle: "le",
    introduction: <>Le Ö, c’est <strong>l’île</strong>. En suédois, cette seule lettre suffit à la nommer.</>,
    description: <>Sur une île, on vit avec l’essentiel. <strong>SÖRNA</strong> en a fait une exigence : ne garder que ce qui sert, et laisser à chaque chose sa juste place. Cette sobriété ne retire rien, elle donne plus de poids à ce qui reste.</>,
  },
  {
    id: "orna",
    title: "Orna",
    label: "ORNA pour orner",
    highlightedTitle: "Or",
    remainingTitle: "na",
    introduction: <>ORNA vient du latin <em>ornare</em>, orner. Le mot s’ouvre sur le même <strong>Ö</strong>, celui de l’île.</>,
    description: <>Orner, d’ordinaire, c’est ajouter. <strong>SÖRNA</strong> l’entend autrement : révéler ce qui est déjà là, sans le masquer. Pour un thé, ne rien ajouter à la feuille. Pour un soin, ne rien parfumer, pour ne rien cacher.</>,
  },
];

const photoRoot = "/figma/ressentir/histoire";

function LetterChapter({ chapter }: { chapter: Chapter }) {
  const isSancerre = chapter.id === "sancerre";
  const letter = isSancerre ? "S" : "Ö";

  return (
    <section
      id={chapter.id}
      className={`${styles.letterChapter} ${isSancerre ? styles.sancerre : styles.ile}`}
      aria-labelledby={`${chapter.id}-title`}
    >
      <header className={styles.letterHeader}>
        <span className={styles.letter} aria-hidden="true">{letter}</span>
        <div className={styles.letterHeading}>
          <p className={styles.letterLabel}>{chapter.label}</p>
          <h2 id={`${chapter.id}-title`} className={styles.letterTitle}>{chapter.title}</h2>
        </div>
      </header>
      <div className={`${styles.mainPhoto} image-grain`}>
        <Image
          src={`${photoRoot}/${chapter.id}-photo-${isSancerre ? "panoramique" : "gauche"}.png`}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 65vw"
          className="object-cover"
        />
      </div>
      <div className={styles.letterIntroduction}>{chapter.introduction && <p>{chapter.introduction}</p>}</div>
      <div className={`${styles.insetPhoto} image-grain`}>
        <Image
          src={`${photoRoot}/${chapter.id}-photo-${isSancerre ? "gauche" : "panoramique"}.png`}
          alt=""
          fill
          sizes="(max-width: 767px) 75vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className={`${styles.detailPhoto} image-grain`}>
        <Image src={`${photoRoot}/${chapter.id}-photo-droite.png`} alt="" fill sizes="(max-width: 767px) 42vw, 25vw" className="object-cover" />
      </div>
      <div className={styles.letterDescription}>{chapter.description && <p>{chapter.description}</p>}</div>
    </section>
  );
}

export default function OriginChapters() {
  return chapters.map((chapter) => {
    if (chapter.id !== "orna") {
      return <LetterChapter key={chapter.id} chapter={chapter} />;
    }

    return (
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
        <p className={styles.letterLabel}>{chapter.label}</p>
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
    </section>
    );
  });
}
