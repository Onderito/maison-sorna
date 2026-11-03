import type { Metadata } from "next";
import Image from "next/image";
import UniversHero from "@/components/univers-hero";
import SiteFooter from "@/components/site-footer";
import AccordSection from "./accord-section";
import ReceptionForm from "./reception-form";
import styles from "./recevoir.module.css";

export const metadata: Metadata = {
  title: "Professionnels, hôtellerie, restauration, bar | SÖRNA",
  description: "Des crus de thé pour les restaurants, les pâtissiers, les bars et les hôtels. Dégustation sur place, sans engagement, et book sur demande.",
};

const reasons = [
  { title: "Des crus, pas des mélanges.", text: "Cinq cuvées pures, sans arôme ajouté, chacune analysée par un laboratoire indépendant avant sa mise en vente." },
  { title: "Des formats pour le service.", text: "Des sachets de 250 g et de 500 g, et une boîte de 2,5 kg pour la salle et le bar." },
  { title: "Un service pensé pour vous.", text: "En théière pour deux ou quatre, au gaiwan, ou infusé à froid en carafe." },
];

export default function RecevoirPage() {
  return <>
    <main className={styles.page}>
      <UniversHero id="recevoir" title={<>Le sens<br />de l’accueil</>} subtitle="Hôtellerie, restauration, bar" scrollTarget="#introduction">
        <Image src="/recevoir/hero-table.png" alt="" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroShade} />
      </UniversHero>

      <section id="introduction" className={styles.introduction} aria-labelledby="introduction-title">
        <p className={styles.eyebrow}>SÖRNA · Les professionnels</p>
        <h2 id="introduction-title">Vous composez les plats,<br /><em>nous apportons le thé.</em></h2>
        <p className={styles.introCopy}>Un thé se sert comme un vin : à la bonne température, au bon moment du repas, avec la même attention. Nous accompagnons les restaurants, les pâtissiers, les bars et les hôtels qui veulent offrir ce moment à leurs hôtes.</p>
      </section>

      <section id="pourquoi-sorna" className={styles.reasons} aria-labelledby="pourquoi-title">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>L’exigence de la Maison</p><h2 id="pourquoi-title">Pourquoi SÖRNA</h2></div>
        <div className={styles.reasonLayout}>
          <figure className={styles.reasonFigure}>
            <div className={`${styles.reasonPhoto} image-grain`}>
              <Image src="/recevoir/fondateurs-vignes.png" alt="Les deux fondateurs de SÖRNA devant les vignes" fill sizes="(max-width: 767px) 100vw, 46vw" className={styles.reasonImage} />
            </div>
            <figcaption>Le goût du détail, l’attention du service.</figcaption>
          </figure>
          <div className={styles.reasonChapters}>{reasons.map((reason, index) => <article key={reason.title} className={styles.reason}>
            <div className={styles.reasonContent}>
              <span className={styles.reasonIndex}>{["I", "II", "III"][index]}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </div>
          </article>)}</div>
        </div>
      </section>

      <AccordSection />

      <section id="du-matin-au-soir" className={styles.hospitality} aria-labelledby="hospitality-title">
        <div className={styles.hospitalityHeading}>
          <p className={styles.eyebrow}>Du matin au soir</p>
          <h2 id="hospitality-title">Dans vos chambres,<br />vos salons <em>et votre bar.</em></h2>
        </div>
        <figure className={styles.hospitalityFigure}>
          <div className={`${styles.hospitalityPhoto} image-grain`}>
            <Image src="/figma/infuser/product/sourcil-photo.png" alt="Une tasse de feuilles de thé Sourcil d’Or dans la lumière du matin" fill sizes="(max-width: 767px) 100vw, 38vw" className={styles.hospitalityImage} />
          </div>
          <figcaption>Sourcil d’Or · La douceur du matin</figcaption>
        </figure>
        <div className={styles.hospitalityBody}>
          <p className={styles.lead}>Du petit-déjeuner au dernier thé du soir, SÖRNA accompagne la journée de vos hôtes.</p>
          <p className={styles.hospitalityCopy}>En chambre, un cru et sa théière, prêts en quelques minutes. Au salon et au bar, les Cinq Sommets, en théière ou infusés à froid. Au petit-déjeuner, Sourcil d’Or et sa douceur de miel.</p>
          <p className={styles.future}>Et dès 2027, des soins pour vos cabines de spa et vos chambres.</p>
        </div>
      </section>

      <section id="degustation" className={styles.tasting} aria-labelledby="tasting-title">
        <p className={styles.eyebrow}>Une rencontre, cinq cuvées</p><h2 id="tasting-title">Goûtons <em>ensemble.</em></h2>
        <p>Nous venons à vous, avec les cinq cuvées et tout le nécessaire. Quarante-cinq minutes, sans engagement : on goûte ensemble, et vous jugez par vous-même de ce qui fonctionne avec vos assiettes, votre service, vos hôtes.</p>
        <div className={styles.buttons}><a href="#demande" className={styles.button}>Demander une dégustation <span aria-hidden="true">↗</span></a><a href="#demande" className={styles.secondaryButton}>Recevoir le book <span aria-hidden="true">↗</span></a></div>
        <p className={styles.tastingNote}>Notre book professionnel vous est envoyé dès votre demande.<br />Les prix professionnels sont communiqués sur demande.</p>
      </section>

      <section id="demande" className={styles.request} aria-labelledby="request-title">
        <div className={styles.requestIntro}><p className={styles.eyebrow}>Faisons connaissance</p><h2 id="request-title">Votre maison,<br /><em>notre rencontre.</em></h2><p>Parlez-nous de votre établissement et de vos envies.</p><a href="mailto:contact@sorna.fr">contact@sorna.fr</a></div>
        <ReceptionForm />
      </section>
    </main>
    <SiteFooter />
  </>;
}
