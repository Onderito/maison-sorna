import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./origin-chapters.module.css";
import OriginChapterReveal from "./origin-chapter-reveal";

type Chapter = {
  id: string;
  title: string;
  label: string;
  introduction?: ReactNode;
  description?: ReactNode;
};

const chapters: Chapter[] = [
  {
    id: "sancerre",
    title: "Sancerre",
    label: "S pour Sancerre",
    introduction: <>Le S, c’est <strong>Sancerre</strong>. Le vignoble où le fondateur a grandi, et la terre où <strong>SÖRNA</strong> garde ses racines.</>,
    description: <>Sur ces coteaux, entre terres blanches, caillottes et silex, on apprend tôt qu’un même sauvignon ne donne jamais deux fois le même vin. La parcelle, le sol et l’année décident. C’est ce regard, tourné vers le lieu avant le produit, que <strong>SÖRNA</strong> porte sur chaque thé et chaque soin.</>,
  },
  {
    id: "ile",
    title: "L’Île",
    label: "Ö pour l’île",
    introduction: <>Le Ö, c’est <strong>l’île</strong>. En suédois, cette seule lettre suffit à la nommer.</>,
    description: <>Sur une île, on vit avec l’essentiel. <strong>SÖRNA</strong> en a fait une exigence : ne garder que ce qui sert, et laisser à chaque chose sa juste place. Cette sobriété ne retire rien, elle donne plus de poids à ce qui reste.</>,
  },
  {
    id: "orna",
    title: "Orna",
    label: "ORNA pour orner",
    introduction: <>ORNA vient du latin <em>ornare</em>, orner. Le mot s’ouvre sur le même <strong>Ö</strong>, celui de l’île.</>,
    description: <>Orner, d’ordinaire, c’est ajouter. <strong>SÖRNA</strong> l’entend autrement : révéler ce qui est déjà là, sans le masquer. Pour un thé, ne rien ajouter à la feuille. Pour un soin, ne rien parfumer, pour ne rien cacher.</>,
  },
];

const photoRoot = "/figma/ressentir/histoire";

function LetterChapter({ chapter }: { chapter: Chapter }) {
  const isSancerre = chapter.id === "sancerre";
  const letter = isSancerre ? "S" : chapter.id === "ile" ? "Ö" : "O";
  const isLandscape = chapter.id !== "ile";

  return (
    <OriginChapterReveal
      id={chapter.id}
      className={`${styles.letterChapter} ${styles[chapter.id]}`}
      aria-labelledby={`${chapter.id}-title`}
    >
      <header className={styles.letterHeader} data-origin-header>
        <span className={styles.letter} aria-hidden="true" data-origin-heading-detail>{letter}</span>
        <div className={styles.letterHeading}>
          <p className={styles.letterLabel} data-origin-heading-detail>{chapter.label}</p>
          <h2 id={`${chapter.id}-title`} className={styles.letterTitle} aria-label={chapter.title}>
            <span className={styles.titleLetters} aria-hidden="true">
              {Array.from(chapter.title).map((character, index) => (
                <span className={styles.characterMask} key={`${character}-${index}`}>
                  <span className={styles.character} data-origin-character>{character}</span>
                </span>
              ))}
            </span>
          </h2>
        </div>
      </header>
      <div className={`${styles.mainPhoto} image-grain`} data-origin-photo>
        <Image
          src={`${photoRoot}/${chapter.id}-photo-${isLandscape ? "panoramique" : "gauche"}.png`}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 65vw"
          className="object-cover"
        />
      </div>
      <div className={styles.letterIntroduction} data-origin-copy>{chapter.introduction && <p>{chapter.introduction}</p>}</div>
      <div className={`${styles.insetPhoto} image-grain`} data-origin-photo>
        <Image
          src={`${photoRoot}/${chapter.id}-photo-${isLandscape ? "gauche" : "panoramique"}.png`}
          alt=""
          fill
          sizes="(max-width: 767px) 75vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className={`${styles.detailPhoto} image-grain`} data-origin-photo>
        <Image src={`${photoRoot}/${chapter.id}-photo-droite.png`} alt="" fill sizes="(max-width: 767px) 42vw, 25vw" className="object-cover" />
      </div>
      <div className={styles.letterDescription} data-origin-copy>{chapter.description && <p>{chapter.description}</p>}</div>
    </OriginChapterReveal>
  );
}

export default function OriginChapters() {
  return chapters.map((chapter) => <LetterChapter key={chapter.id} chapter={chapter} />);
}
