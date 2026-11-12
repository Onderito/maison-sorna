import { pageMetadata } from "@/app/lib/seo/site";
import Image from "next/image";
import SeamlessBackgroundVideo from "@/components/seamless-background-video";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";
import AccordSection from "./accord-section";
import ReceptionForm from "./reception-form";
import ReceptionMotion from "./reception-motion";
import styles from "./recevoir.module.css";
import heroMedia from "@/components/hero-media.module.css";

export const metadata = pageMetadata("/recevoir", "Thés pour hôtels, restaurants et bars | SÖRNA", "Des crus de thé pour les restaurants, les pâtissiers, les bars et les hôtels. Découvrez notre accompagnement et demandez une dégustation professionnelle.", "/recevoir/hero-table.png");

const reasons = [
  { title: "Des crus, pas des mélanges.", text: "Cinq crus purs, sans arôme ajouté. Chaque récolte est analysée par un laboratoire indépendant avant sa mise en vente, notamment pour les métaux lourds." },
  { title: "Des formats pour le service.", text: "Des conditionnements au choix, selon vos besoins et ceux de votre service." },
  { title: "Un service pensé pour vous.", text: "En théière ou au gaiwan." },
];

export default function RecevoirPage() {
  return <>
    <ReceptionMotion className={styles.page}>
      <UniversHero id="recevoir" title={<>Le sens<br />de l’accueil</>} subtitle="Hôtellerie, restauration, bar" scrollTarget="#introduction">
        <SeamlessBackgroundVideo src="/recevoir/hero-table-loop-v1.mp4" poster="/recevoir/hero-table-loop-v1-poster.jpg" seamlessLoop className={`size-full ${heroMedia.reception}`} />
        <div className={styles.heroShade} />
      </UniversHero>

      <section id="introduction" className={styles.introduction} aria-labelledby="introduction-title">
        <p className={styles.eyebrow} data-reception-detail>SÖRNA · Les professionnels</p>
        <h2 id="introduction-title" data-reception-text>Vous composez les plats,<br /><em>nous apportons le thé.</em></h2>
        <p className={styles.introCopy} data-reception-text>Un thé se sert comme un vin : à la bonne température, au bon moment du repas, avec la même attention. Nous accompagnons les restaurants, les pâtissiers, les bars et les hôtels qui veulent offrir ce moment à leurs hôtes.</p>
      </section>

      <section id="pourquoi-sorna" className={styles.reasons} aria-labelledby="pourquoi-title">
        <div className={styles.sectionHeading}><p className={styles.eyebrow} data-reception-detail>L’exigence de la Maison</p><h2 id="pourquoi-title" data-reception-text>Pourquoi SÖRNA</h2></div>
        <div className={styles.reasonLayout} data-reception-photo-track>
          <figure className={styles.reasonFigure}>
            <div className={styles.reasonPhoto}>
              <div className={`${styles.reasonReveal} image-grain`} data-reception-photo="founders">
                <Image src="/recevoir/fondateurs-vignes.png" alt="Les deux fondateurs de SÖRNA devant les vignes" fill sizes="(max-width: 1199px) 100vw, 46vw" className={styles.reasonImage} data-reception-parallax />
              </div>
            </div>
            <figcaption data-reception-detail>Le goût du détail, l’attention du service.</figcaption>
          </figure>
          <div className={styles.reasonChapters}>{reasons.map((reason, index) => <article key={reason.title} className={styles.reason}>
            <div className={styles.reasonContent}>
              <span className={styles.reasonIndex} data-reception-detail>{["I", "II", "III"][index]}</span>
              <h3 data-reception-text>{reason.title}</h3>
              <p data-reception-text>{reason.text}</p>
            </div>
          </article>)}</div>
        </div>
      </section>

      <AccordSection />

      <section id="du-matin-au-soir" className={styles.hospitality} aria-labelledby="hospitality-title">
        <div className={styles.hospitalityHeading}>
          <p className={styles.eyebrow} data-reception-detail>Une montée en gamme</p>
          <h2 id="hospitality-title" data-reception-text>Dans vos chambres,<br />vos salons <em>et votre bar.</em></h2>
        </div>
        <figure className={styles.hospitalityFigure} data-reception-photo-track>
          <div className={styles.hospitalityPhoto}>
            <div className={`${styles.hospitalityReveal} image-grain`} data-reception-photo="hospitality">
              <Image src="/recevoir/terrasse-hotel.png" alt="Une personne de dos savoure son thé sur une terrasse face aux vignes, près d’une table nappée de lin" fill sizes="(max-width: 767px) 100vw, (max-width: 1199px) 80vw, 38vw" className={styles.hospitalityImage} data-reception-parallax />
            </div>
          </div>
          <figcaption data-reception-detail>Les Cinq Sommets · Cinq expressions du thé</figcaption>
        </figure>
        <div className={styles.hospitalityBody}>
          <p className={styles.lead} data-reception-text>Comme une carte des vins accueille de belles références, votre sélection de thés peut s’enrichir de crus singuliers, pour les hôtes qui souhaitent prolonger la découverte.</p>
          <p className={styles.hospitalityCopy} data-reception-text>Avec les Cinq Sommets, SÖRNA propose cinq expressions du thé, chacune portée par une origine, une récolte et un caractère. En complément de votre offre actuelle, ces crus apportent une expérience de dégustation à la hauteur de l’attention que vous portez à vos clients.</p>
          <p className={styles.future} data-reception-detail>Et dès 2027, des soins pour vos spas et vos chambres.</p>
        </div>
      </section>

      <section id="degustation" className={styles.tasting} aria-labelledby="tasting-title">
        <p className={styles.eyebrow} data-reception-detail>Une rencontre, cinq crus</p><h2 id="tasting-title" data-reception-text>Goûtons <em>ensemble.</em></h2>
        <p data-reception-text>Nous venons à vous, avec les cinq crus et tout le nécessaire. Quarante-cinq minutes, sans engagement : on goûte ensemble, et vous jugez par vous-même de ce qui fonctionne avec vos assiettes, votre service, vos hôtes.</p>
        <div className={styles.buttons} data-reception-detail><a href="#demande" className={styles.button}>Demander une dégustation <span aria-hidden="true">→</span></a><a href="#demande" className={styles.secondaryButton}>Recevoir le book <span aria-hidden="true">→</span></a></div>
        <p className={styles.tastingNote} data-reception-detail>Notre book professionnel vous est envoyé dès votre demande.<br />Les prix professionnels sont communiqués après le rendez-vous.</p>
      </section>

      <section id="demande" className={styles.request} aria-labelledby="request-title">
        <Image src="/recevoir/entree-hotel.webp" alt="" fill sizes="100vw" className={styles.requestImage} />
        <ReceptionForm introduction={<div className={styles.requestIntro}><p className={styles.eyebrow} data-reception-detail>Faisons connaissance</p><h2 id="request-title" data-reception-text>Votre maison,<br /><em>notre rencontre.</em></h2><p data-reception-text>Un lieu, une envie.<br />Imaginons la suite, ensemble.</p></div>} />
      </section>
    </ReceptionMotion>
    <SiteFooter />
  </>;
}
