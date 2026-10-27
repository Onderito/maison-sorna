"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./authenticity-section.module.css";
import { useAuthenticityReveal } from "@/animations/use-authenticity-reveal";

const commitments = [
  { text: "Chaque formule de soin est publiée en entier, proportions et origines comprises.", image: "formule" },
  { text: "Chaque lot de thé est analysé par un laboratoire indépendant.", image: "analyse-the" },
  { text: "Chaque soin est testé sous contrôle dermatologique, et son efficacité mesurée en laboratoire.", image: "test-soin" },
  { text: "Tous les résultats sont consultables.", image: "resultats" },
];

export default function AuthenticitySection() {
  const { sectionRef, revealImmediately } = useAuthenticityReveal();
  const trackRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function goToCard(index: number) {
    revealImmediately();
    const track = trackRef.current;
    const card = track?.children.item(index);
    if (!track || !(card instanceof HTMLElement)) return;

    track.scrollTo({
      left: card.offsetLeft - (track.firstElementChild as HTMLElement).offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <section ref={sectionRef} id="la-preuve" className={styles.section} aria-labelledby="authenticity-title"
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) revealImmediately();
      }}
    >
      <header className={styles.header}>
        <h2 id="authenticity-title" className={styles.title}>
          <span className={styles.titleMask}><span data-proof-title>La preuve</span></span>
        </h2>
        <p data-proof-introduction>Nous ne revendiquons que ce qui a été mesuré.</p>
      </header>
      <ol
        id="authenticity-cards"
        ref={trackRef}
        data-proof-track
        onPointerDown={revealImmediately}
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
        {commitments.map((commitment) => (
          <li key={commitment.image} className={styles.card}>
            <p data-proof-copy>{commitment.text}</p>
            <div className={styles.photograph} data-proof-photo>
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
