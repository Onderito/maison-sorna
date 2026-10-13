"use client";

import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import styles from "./univers-carousel.module.css";

const univers = [
  { id: "infuser", name: "Infuser", label: "01 — Infuser", image: "/figma/infuser/landscape.png" },
  { id: "appliquer", name: "Appliquer", label: "02 — Appliquer", image: "/figma/appliquer/background.png" },
  { id: "ressentir", name: "Ressentir", label: "03 — Ressentir", image: "/figma/ressentir/background.png" },
] as const;

function UniversLink({ item, active }: { item: (typeof univers)[number]; active: boolean }) {
  return (
    <Link href={`/${item.id}`} aria-label={`Découvrir ${item.name}`} className={styles.link} data-active={active}>
      <span className={styles.label}>{item.label}</span>
      <span className={styles.arrow} aria-hidden="true">↗</span>
    </Link>
  );
}

export default function UniversCarousel() {
  const container = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  // Lenis smooths the scroll itself; a second spring would lag behind the sticky section.
  const progress = scrollYProgress;
  // Each new panel covers the previous one, which stays still underneath.
  const appliquerX = useTransform(progress, [0, 0.5], ["100%", "0%"]);
  const ressentirX = useTransform(progress, [0.5, 1], ["100%", "0%"]);
  const panelPositions = ["0%", appliquerX, ressentirX];
  useMotionValueEvent(progress, "change", (value) => setActive(Math.max(0, Math.min(2, Math.round(value * 2)))));

  function goToScene(index: number) {
    const element = container.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const target = top + (element.offsetHeight - window.innerHeight) * index / 2;
    if (lenis) {
      lenis.scrollTo(target, { immediate: Boolean(reducedMotion) });
    } else {
      window.scrollTo({ top: target, behavior: "instant" });
    }
  }

  if (reducedMotion) {
    return (
      <section id="infuser" aria-label="Les univers SÖRNA">
        {univers.map((item) => (
          <section key={item.id} className="relative isolate min-h-svh overflow-hidden bg-text-on-light text-text-on-dark">
            <div className="absolute inset-0 -z-10 isolate" aria-hidden="true">
              <Image src={item.image} alt="" fill sizes="100vw" className="object-cover object-bottom" />
              <span className="image-grain-overlay" />
            </div>
            <Link href={`/${item.id}`} aria-label={`Explorer l’univers ${item.name}`} className={styles.sceneLink} />
            <div className={`site-container ${styles.navigation}`}>
              <UniversLink item={item} active />
            </div>
          </section>
        ))}
      </section>
    );
  }

  return (
    <section ref={container} id="infuser" aria-label="Les trois univers SÖRNA" className="relative h-[300svh] bg-text-on-light text-text-on-dark">
      <div
        className="sticky top-0 h-svh overflow-hidden"
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          goToScene(Math.max(0, Math.min(2, active + (event.key === "ArrowRight" ? 1 : -1))));
        }}
      >
        <div className="absolute inset-0 isolate" aria-hidden="true">
          {univers.map((item, index) => (
            <motion.div key={item.id} style={{ x: panelPositions[index] }} className="absolute inset-0 bg-text-on-light">
              <div className="image-grain size-full">
                <Image src={item.image} alt="" fill sizes="100vw" className="object-cover object-bottom" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" aria-hidden="true" />

        <div aria-hidden="true" className="absolute top-1/2 left-[var(--layout-margin)] flex -translate-y-1/2 flex-col gap-3 lg:left-[1.5%]">
          {univers.map((item, index) => (
            <span key={item.id} className="flex size-[14px] items-center justify-center">
              <span className={`size-2.5 rotate-[43.52deg] border-[0.5px] border-white transition-colors duration-300 ${index === active ? "bg-white" : "bg-white/10"}`} />
            </span>
          ))}
        </div>

        <Link
          href={`/${univers[active].id}`}
          aria-label={`Explorer l’univers ${univers[active].name}`}
          className={styles.sceneLink}
        />

        <ol aria-label="Découvrir les univers SÖRNA" className={`site-container ${styles.navigation}`}>
          {univers.map((item, index) => (
            <li key={item.id} aria-current={index === active ? "step" : undefined}>
              <UniversLink item={item} active={index === active} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
