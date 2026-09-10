"use client";

import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { useRef, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

const univers = [
  { id: "infuser", name: "Infuser", label: "01- Infuser", image: "/figma/infuser/landscape.png" },
  { id: "appliquer", name: "Appliquer", label: "02 - Appliquer", image: "/figma/appliquer/background.png" },
  { id: "ressentir", name: "Ressentir", label: "03 - Ressentir", image: "/figma/ressentir/background.png" },
] as const;

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
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const cardX = useSpring(pointerX, { stiffness: 110, damping: 26, mass: 0.5 });
  const cardY = useSpring(pointerY, { stiffness: 110, damping: 26, mass: 0.5 });
  const scene = univers[active];

  function followPointer(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse" || event.target instanceof Element && event.target.closest("a, button")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const limitX = Math.max(0, bounds.width / 2 - 130);
    const limitY = Math.max(0, bounds.height / 2 - 190);
    pointerX.set(Math.max(-limitX, Math.min(limitX, event.clientX - bounds.left - bounds.width / 2)));
    pointerY.set(Math.max(-limitY, Math.min(limitY, event.clientY - bounds.top - bounds.height / 2)));
  }

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
      <section id="infuser" aria-label="Les univers Maison Sörna">
        {univers.map((item) => (
          <section key={item.id} className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-text-on-light text-text-on-dark">
            <Image src={item.image} alt="" fill sizes="100vw" className="-z-10 object-cover object-bottom" />
            <Link href={`/${item.id}`} className="bg-button px-6 py-4 font-sans text-text-on-dark">Découvrir {item.name} →</Link>
          </section>
        ))}
      </section>
    );
  }

  return (
    <section ref={container} id="infuser" aria-label="Les trois univers Maison Sörna" className="relative h-[300svh] bg-text-on-light text-text-on-dark">
      <div
        className="sticky top-0 h-svh overflow-hidden"
        onPointerMove={followPointer}
        onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
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

        <motion.div style={{ x: cardX, y: cardY }} className="absolute top-1/2 left-1/2 z-10">
          <Link
            href={`/${scene.id}`}
            aria-label={`Découvrir ${scene.name}`}
            onFocus={(event) => {
              if (!event.currentTarget.matches(":focus-visible")) return;
              pointerX.jump(0); pointerY.jump(0); cardX.jump(0); cardY.jump(0);
            }}
            className="relative block h-[200px] w-[156px] -translate-x-1/2 -translate-y-1/2 rotate-[4.71deg] overflow-hidden border-2 border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-on-dark md:h-[240px] md:w-[188px]"
          >
            {univers.map((item, index) => (
              <div key={item.id} className={`absolute inset-0 transition-opacity duration-500 ${index === active ? "opacity-100" : "opacity-0"}`}>
                <div className="image-grain size-full">
                  <Image src={`/figma/${item.id}/discover.png`} alt="" fill sizes="188px" className={`object-cover ${item.id === "appliquer" ? "object-[79%_center]" : "object-center"}`} />
                </div>
              </div>
            ))}
            <span className="absolute inset-0 flex items-center justify-center bg-black/10 font-sans text-base font-light text-text-on-dark md:text-xl">Découvrir →</span>
          </Link>
        </motion.div>

        <ol aria-label="Univers actif" className="site-container absolute inset-x-0 bottom-8 flex items-center justify-between gap-2 font-display text-[clamp(1.125rem,3.24vw,3.5rem)] leading-normal whitespace-nowrap lg:bottom-[4.2%] lg:w-[88.4%] lg:max-w-[1528px]">
          {univers.map((item, index) => (
            <li key={item.id} aria-current={index === active ? "step" : undefined} className={`flex min-h-11 items-center transition-colors duration-300 ${index === active ? "text-text-on-dark" : "text-text-on-dark/60"}`}>{item.label}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
