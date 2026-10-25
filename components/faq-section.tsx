import Image from "next/image";
import FaqAccordion from "./faq-accordion";
import FaqEntrance from "./faq-entrance";
import styles from "./faq-section.module.css";

const questions = [
  {
    id: "origine",
    question: "D’où viennent vos thés ?",
    answer: "De Chine, principalement du Fujian. Le lieu et la récolte de chaque cuvée sont indiqués sur sa fiche.",
  },
  {
    id: "preparation",
    question: "Comment préparer chaque cuvée ?",
    answer: "Suivez les repères de votre cuvée pour la dose, la température et la durée, puis ajustez à votre goût. Les mêmes feuilles peuvent être infusées plusieurs fois, avec une tasse différente à chaque passage.",
  },
  {
    id: "aromes",
    question: "Vos thés sont-ils aromatisés ?",
    answer: "Non, nos thés sont sans arôme ajouté ni assemblage. Leurs notes de miel, de fleurs ou de fruits viennent de la feuille, de son terroir et du travail des producteurs.",
  },
  {
    id: "analyses",
    question: "Vos thés sont-ils analysés ?",
    answer: "Oui. Chaque lot est analysé par un laboratoire indépendant avant sa mise en vente. Les résultats sont consultables pour chaque lot.",
  },
  {
    id: "conservation",
    question: "Combien de temps se garde un thé ?",
    answer: "Gardez le pot fermé, à l’abri de la lumière, de la chaleur, de l’humidité et des odeurs. Le thé vert se boit plutôt dans l’année. Les thés blancs et oolongs torréfiés peuvent gagner en profondeur avec le temps. Retrouvez la date de référence sur l’emballage.",
  },
];

export default function FaqSection() {
  return (
    <FaqEntrance>
      <header className={styles.header}>
        <h2 data-faq-title id="faq-title" className={styles.title}>SÖRNA vous répond</h2>
        <p data-faq-introduction className={styles.introduction}>
          Origine, préparation, conservation. L’essentiel pour choisir, servir et garder nos thés.
        </p>
      </header>
      <div className={styles.content}>
        <div data-faq-photograph className={`${styles.photograph} image-grain`}>
          <Image
            src="/figma/faq/tea-leaves.png"
            alt="Jeunes feuilles de thé couvertes de rosée."
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            loading="eager"
            className={styles.image}
          />
        </div>
        <div className={styles.responses}>
          <FaqAccordion questions={questions} />
          <button
            type="button"
            data-faq-contact
            className={styles.contact}
            disabled
            title="Le contact sera bientôt disponible"
          >
            Une autre question ? Écrivez-nous.
          </button>
        </div>
      </div>
    </FaqEntrance>
  );
}
