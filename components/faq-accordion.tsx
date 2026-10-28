"use client";

import { useState } from "react";
import styles from "./faq-section.module.css";

type FaqQuestion = {
  id: string;
  question: string;
  answer: string;
};

function FaqItem({
  id,
  question,
  answer,
  expanded,
  onToggle,
}: FaqQuestion & { expanded: boolean; onToggle: (keyboard: boolean) => void }) {
  return (
    <div className={styles.item} data-faq-item data-expanded={expanded}>
      <span className={styles.highlight} aria-hidden="true" />
      <h3 className={styles.questionHeading}>
        <button
          id={`faq-question-${id}`}
          type="button"
          aria-expanded={expanded}
          aria-controls={`faq-answer-${id}`}
          className={styles.question}
          onClick={(event) => onToggle(event.detail === 0)}
        >
          <span>{question}</span>
          <span className={styles.indicator} aria-hidden="true">
            <span className={styles.indicatorHorizontal} />
            <span className={styles.indicatorVertical} />
          </span>
        </button>
      </h3>
      <div
        id={`faq-answer-${id}`}
        role="region"
        aria-labelledby={`faq-question-${id}`}
        aria-hidden={!expanded}
        inert={!expanded}
        className={styles.answer}
      >
        <div className={styles.answerContent}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqAccordion({ questions }: { questions: readonly FaqQuestion[] }) {
  const [{ openId, keyboard }, setSelection] = useState<{ openId: string | null; keyboard: boolean }>({
    openId: questions[0]?.id ?? null,
    keyboard: false,
  });

  return (
    <div data-faq-accordion data-instant={keyboard || undefined} className={styles.accordion}>
      {questions.map((question) => (
        <FaqItem
          key={question.id}
          {...question}
          expanded={openId === question.id}
          onToggle={(keyboard) => setSelection((current) => ({
            openId: current.openId === question.id ? null : question.id,
            keyboard,
          }))}
        />
      ))}
    </div>
  );
}
