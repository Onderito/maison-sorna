"use client";

import { useId, useState } from "react";
import styles from "./faq-section.module.css";

type FaqQuestion = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqAccordion({ questions }: { questions: readonly FaqQuestion[] }) {
  const group = useId();
  const [keyboard, setKeyboard] = useState(false);

  return (
    <div
      data-faq-accordion
      data-instant={keyboard || undefined}
      className={styles.accordion}
      onKeyDown={() => setKeyboard(true)}
      onPointerDown={() => setKeyboard(false)}
    >
      {questions.map(({ id, question, answer }, index) => (
        <details key={id} name={group} open={index === 0} className={styles.item} data-faq-item>
          <summary className={styles.question}>
            <span>{question}</span>
            <span className={styles.indicator} aria-hidden="true">
              <span className={styles.indicatorHorizontal} />
              <span className={styles.indicatorVertical} />
            </span>
          </summary>
          <span className={styles.highlight} aria-hidden="true" />
          <div className={styles.answer}>
            <div className={styles.answerContent}>
              <p>{answer}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
