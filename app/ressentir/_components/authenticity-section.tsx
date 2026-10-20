"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./authenticity-section.module.css";

const commitments = [
  { text: "La formule complète est publiée.", image: "formule" },
  { text: "Chaque lot de thé est analysé.", image: "analyse-the" },
  { text: "Chaque soin est testé.", image: "test-soin" },
  { text: "Les résultats sont publics", image: "resultats" },
];

export default function AuthenticitySection() {
  const trackRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function goToCard(index: number) {
    const track = trackRef.current;
    const card = track?.children.item(index);
    if (!track || !(card instanceof HTMLElement)) return;

    track.scrollTo({
      left: card.offsetLeft - (track.firstElementChild as HTMLElement).offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <section id="l-authenticite" className={styles.section} aria-labelledby="authenticity-title">
      <header className={styles.header}>
        <h2 id="authenticity-title" className={styles.title}>L’authenticité</h2>
        <p>Nous ne revendiquons que ce qui a été mesuré.</p>
      </header>
      <ol
        id="authenticity-cards"
        ref={trackRef}
        className={styles.cards}
        tabIndex={0}
        aria-label="Nos quatre engagements"
        onScroll={() => {
          const track = trackRef.current;
          if (!track) return;
          const first = track.firstElementChild as HTMLElement;
          let nearest = 0;
          let distance = Infinity;
          Array.from(track.children).forEach((child, index) => {
            const offset = Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - track.scrollLeft);
            if (offset < distance) {
              nearest = index;
              distance = offset;
            }
          });
          setActiveIndex(nearest);
        }}
      >
        {commitments.map((commitment, index) => (
          <li key={commitment.image} className={styles.card}>
            <span className={styles.number} aria-hidden="true">0{index + 1}</span>
            <p>{commitment.text}</p>
            <div className={styles.photograph}>
              <Image
                src={`/figma/ressentir/authenticite/${commitment.image}.png`}
                alt=""
                fill
                sizes="(max-width: 767px) calc(100vw - 40px), 22vw"
                className={styles.image}
              />
            </div>
          </li>
        ))}
      </ol>
      <nav className={styles.navigation} aria-label="Choisir un engagement">
        {commitments.map((commitment, index) => (
          <button
            key={commitment.image}
            type="button"
            aria-label={`Engagement ${index + 1} sur 4 : ${commitment.text}`}
            aria-controls="authenticity-cards"
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => goToCard(index)}
          >
            <span />
          </button>
        ))}
      </nav>
    </section>
  );
}
