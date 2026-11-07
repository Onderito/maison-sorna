import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./regard-sections.module.css";
import chapterStyles from "./origin-chapters.module.css";
import OriginChapterReveal from "./origin-chapter-reveal";

type RegardSection = {
  id: string;
  title: string;
  introduction: string;
  images: { main: string; inset: string; detail: string };
  leftTitle: string;
  leftText: ReactNode;
  rightTitle: string;
  rightText: ReactNode;
  ingredient?: { title: string; text: ReactNode };
};

const sections: RegardSection[] = [
  {
    id: "le-the",
    title: "Le thé",
    introduction: "Ce regard s’est d’abord posé sur les monts Wuyi, au nord du Fujian, en Chine. Comme à Sancerre, la roche, l’altitude et l’exposition y façonnent la feuille, d’une parcelle à l’autre.",
    images: { main: "/figma/infuser/hero-wuyi.png", inset: "/figma/ressentir/regard/le-the.png", detail: "/figma/infuser/process/recolte.png" },
    leftTitle: "Le charme de la roche",
    leftText: <>Sur les oolongs de roche, le massif laisse une signature que l’on appelle là-bas <strong>yan yun</strong> : une minéralité qui persiste longtemps en bouche. Chaque falaise, chaque vallée imprime la sienne.</>,
    rightTitle: "Rien que la feuille",
    rightText: <><strong>Cinq crus</strong> cueillis au printemps, sans assemblage <strong>ni arôme ajouté.</strong> Dans la tasse, ce que la feuille a reçu de son sol et de ceux qui l’ont travaillée.</>,
  },
  {
    id: "le-soin",
    title: "Le soin",
    introduction: "Du thé au soin, la démarche ne change pas : connaître chaque matière, et ne l’employer que pour ce qu’elle apporte.",
    images: { main: "/figma/ressentir/regard/le-soin.png", inset: "/figma/appliquer/hero-soin.png", detail: "/figma/ressentir/regard/bakuchi.jpg" },
    leftTitle: "Anhydre",
    leftText: <><strong>Sans eau</strong>, les formules n’ont pas besoin de conservateur. Elles sont aussi <strong>sans parfum.</strong></>,
    ingredient: { title: "Le bakuchiol", text: <>Dans nos soins, le thé rencontre la vigne et le <strong>bakuchiol</strong>, un actif issu des graines du bakuchi (<em>Psoralea corylifolia</em>).</> },
    rightTitle: "Cinq soins",
    rightText: <><strong>Cinq formules</strong>, une gamme volontairement courte. Peu d’ingrédients, et pour chacun, une raison précise d’être là.</>,
  },
];

function ChapterPhoto({ src, className, sizes, alt = "", caption }: { src: string; className: string; sizes: string; alt?: string; caption?: ReactNode }) {
  return (
    <figure className={`${className} ${caption ? styles.captioned : ""}`} data-origin-photo>
      <div className={caption ? styles.captionedPhoto : undefined}>
        <div className={chapterStyles.photoReveal} data-origin-photo-reveal>
          <div className={`${chapterStyles.photoContent} image-grain`} data-origin-photo-content>
            <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
          </div>
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function ChapterHeading({ id, title }: { id: string; title: string }) {
  return (
    <header className={chapterStyles.letterHeader} data-origin-header>
      <div className={chapterStyles.letterHeading}>
        <h2 id={`${id}-title`} className={chapterStyles.letterTitle} aria-label={title}>
          <span className={chapterStyles.titleLetters} aria-hidden="true">
            {Array.from(title).map((character, index) => (
              <span className={chapterStyles.characterMask} key={`${character}-${index}`}>
                <span className={chapterStyles.character} data-origin-character>{character === " " ? "\u00a0" : character}</span>
              </span>
            ))}
          </span>
        </h2>
      </div>
    </header>
  );
}

function BakuchiPhoto({ src, className }: { src: string; className: string }) {
  return (
    <ChapterPhoto
      src={src}
      className={className}
      sizes="(max-width: 767px) 75vw, 33vw"
      alt="Feuilles et bourgeons de bakuchi, Psoralea corylifolia, plante source de bakuchiol"
      caption={<>
        Bakuchi · <em>Psoralea corylifolia</em><br />
        Photo : <a href="https://commons.wikimedia.org/wiki/File:Psoralea_corylifolia_-_Agri-Horticultural_Society_of_India_-_Alipore_-_Kolkata_2013-01-05_2282.JPG">Biswarup Ganguly</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a> · Cadrage adapté.
      </>}
    />
  );
}

export default function RegardSections() {
  return sections.map((section) => {
    const isCare = section.id === "le-soin";
    return (
      <OriginChapterReveal
        key={section.id}
        id={section.id}
        className={`${chapterStyles.letterChapter} ${isCare ? styles.care : chapterStyles.landscape}`}
        aria-labelledby={`${section.id}-title`}
      >
        <ChapterHeading id={section.id} title={section.title} />
        {isCare ? <>
          <div className={styles.careOpening}>
            <div className={chapterStyles.letterIntroduction} data-origin-copy><p>{section.introduction}</p></div>
            <div className={`${chapterStyles.letterDescription} ${styles.notes}`} data-origin-copy>
              <h3>{section.leftTitle}</h3>
              <p>{section.leftText}</p>
            </div>
          </div>
          <ChapterPhoto src={section.images.main} className={styles.careTexture} sizes="(max-width: 767px) 75vw, 42vw" />
          <div className={`${chapterStyles.letterDescription} ${styles.notes} ${styles.careRange}`} data-origin-copy>
            <h3>{section.rightTitle}</h3>
            <p>{section.rightText}</p>
          </div>
          <ChapterPhoto src={section.images.inset} className={styles.careApplication} sizes="(max-width: 767px) 100vw, 50vw" />
          {section.ingredient && <div className={`${chapterStyles.letterDescription} ${styles.notes} ${styles.careIngredient}`} data-origin-copy>
            <h3>{section.ingredient.title}</h3>
            <p>{section.ingredient.text}</p>
          </div>}
          <BakuchiPhoto src={section.images.detail} className={styles.carePlant} />
        </> : <>
          <ChapterPhoto src={section.images.main} className={chapterStyles.mainPhoto} sizes="(max-width: 767px) 100vw, 65vw" />
          <div className={chapterStyles.letterIntroduction} data-origin-copy><p>{section.introduction}</p></div>
          <ChapterPhoto src={section.images.inset} className={chapterStyles.insetPhoto} sizes="(max-width: 767px) 50vw, 25vw" />
          <ChapterPhoto src={section.images.detail} className={chapterStyles.detailPhoto} sizes="(max-width: 767px) 42vw, 33vw" />
          <div className={`${chapterStyles.letterDescription} ${styles.notes}`}>
            <div data-origin-copy>
              <h3>{section.leftTitle}</h3>
              <p>{section.leftText}</p>
            </div>
            <div data-origin-copy>
              <h3>{section.rightTitle}</h3>
              <p>{section.rightText}</p>
            </div>
          </div>
        </>}
      </OriginChapterReveal>
    );
  });
}
