import Image from "next/image";
import type { ProcessStep } from "../process-steps";
import styles from "./plant-process.module.css";

export default function PlantProcess({
  steps,
}: {
  steps: readonly ProcessStep[];
}) {
  return (
    <div id="infuser" className={styles.process}>
      {steps.map((step) =>
        step.description && step.images ? (
          <section
            key={step.number}
            className={styles.step}
            aria-labelledby={`process-step-${step.number}`}
          >
            <div className={styles.editorial}>
              <div className={styles.copy}>
                <h2
                  id={`process-step-${step.number}`}
                  className="font-display text-[clamp(1.5rem,1.852vw,2rem)] leading-normal font-normal uppercase"
                >
                  <span className="tabular-nums">
                    {String(step.number).padStart(2, "0")}-
                  </span>{" "}
                  {step.title}
                </h2>
                <p className="font-sans text-base leading-normal font-light text-text-on-light/80 md:text-[clamp(1rem,1.158vw,1.25rem)]">
                  {step.description}
                </p>
              </div>
              <div className={styles.botanical}>
                <Image
                  src={step.images.botanical.src}
                  alt={step.images.botanical.alt}
                  fill
                  unoptimized
                  className={styles.botanicalImage}
                />
              </div>
            </div>
            <div className={styles.scene}>
              <Image
                src={step.images.scene.src}
                alt={step.images.scene.alt}
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                unoptimized
                className="object-cover"
              />
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
