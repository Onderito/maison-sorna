"use client";

import { useState } from "react";
import { useFaqItem } from "@/animations/use-faq-item";
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
}: FaqQuestion & { expanded: boolean; onToggle: () => void }) {
  const { itemRef, answerRef, contentRef, indicatorRef, highlightRef, interaction } = useFaqItem(expanded);

  return (
    <div ref={itemRef} className={styles.item} data-faq-item data-expanded={expanded} {...interaction}>
      <span ref={highlightRef} className={styles.highlight} aria-hidden="true" />
      <h3 className={styles.questionHeading}>
        <button
          id={`faq-question-${id}`}
          type="button"
          aria-expanded={expanded}
          aria-controls={`faq-answer-${id}`}
          className={styles.question}
          onClick={onToggle}
        >
          <span>{question}</span>
          <span className={styles.indicator} aria-hidden="true">
            <span className={styles.indicatorHorizontal} />
            <span ref={indicatorRef} className={styles.indicatorVertical} />
          </span>
        </button>
      </h3>
      <div
        ref={answerRef}
        id={`faq-answer-${id}`}
        role="region"
        aria-labelledby={`faq-question-${id}`}
        aria-hidden={!expanded}
        inert={!expanded}
        className={styles.answer}
      >
        <div ref={contentRef} className={styles.answerContent}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqAccordion({ questions }: { questions: readonly FaqQuestion[] }) {
  const [openId, setOpenId] = useState<string | null>(questions[0]?.id ?? null);

  return (
    <div data-faq-accordion className={styles.accordion}>
      {questions.map((question) => (
        <FaqItem
          key={question.id}
          {...question}
          expanded={openId === question.id}
          onToggle={() => setOpenId((current) => current === question.id ? null : question.id)}
        />
      ))}
    </div>
  );
}
