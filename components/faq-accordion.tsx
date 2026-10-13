"use client";

import { useEffect, useRef, useState } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Keep the transition accurate when the text wraps or the fonts finish loading.
    const observer = new ResizeObserver(() => {
      setContentHeight(content.getBoundingClientRect().height);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.item} data-expanded={expanded}>
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
        style={{ height: expanded ? contentHeight ?? "auto" : 0 }}
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
    <div className={styles.accordion}>
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
