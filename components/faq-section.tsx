import Image from "next/image";
import FaqAccordion from "./faq-accordion";
import FaqEntrance from "./faq-entrance";
import styles from "./faq-section.module.css";

// The origin answer comes from Figma; the remaining copy is provisional.
const questions = [
  {
    id: "origine",
    question: "D’où proviennent vos thés ?",
    answer: "Nos cinq cuvées proviennent de Chine, principalement du Fujian. Chaque thé est associé à une origine et à une récolte identifiées.",
  },
  {
    id: "preparation",
    question: "Comment préparer chaque cuvée ?",
    answer: "La température de l’eau et le temps d’infusion varient selon le thé. Suivez les indications de votre cuvée, puis ajustez l’infusion à votre goût.",
  },
  {
    id: "aromes",
    question: "Vos thés contiennent-ils des arômes ajoutés ?",
    answer: "La composition de chaque cuvée est indiquée sur son emballage. Vous y trouverez les informations sur ses ingrédients et la présence éventuelle d’arômes ajoutés.",
  },
  {
    id: "analyses",
    question: "Vos thés sont-ils analysés ?",
    answer: "Pour en savoir plus sur les analyses d’une cuvée, la Maison pourra vous renseigner sur les informations disponibles pour le lot concerné.",
  },
  {
    id: "conservation",
    question: "Combien de temps se conserve le thé ?",
    answer: "Conservez votre thé dans une boîte bien fermée, à l’abri de la lumière, de l’humidité et des odeurs. Reportez-vous à la date indiquée sur l’emballage pour apprécier au mieux votre cuvée.",
  },
];

export default function FaqSection() {
  return (
    <FaqEntrance>
      <header className={styles.header}>
        <h2 id="faq-title" className={styles.title}>Sörna vous répond</h2>
        <p className={styles.introduction}>
          Origine, préparation, composition. Quelques réponses
          <br className={styles.lineBreak} /> pour mieux connaître notre Maison.
        </p>
      </header>
      <div className={styles.content}>
        <div className={`${styles.photograph} image-grain`}>
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
            className={styles.contact}
            disabled
            title="Le contact sera bientôt disponible"
          >
            Vous avez une autre question ?
          </button>
        </div>
      </div>
    </FaqEntrance>
  );
}
