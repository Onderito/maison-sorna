import Image from "next/image";
import type { ProcessStep } from "../process-steps";
import ProcessTransitions from "./process-transitions";
import ProcessIntroduction from "./process-introduction";
import styles from "./plant-process.module.css";

export default function PlantProcess({
  steps,
}: {
  steps: readonly ProcessStep[];
}) {
  return (
    <div id="infuser" className={styles.process}>
      <ProcessIntroduction />
      <ProcessTransitions className={styles.panels}>
        {steps.map((step, index) =>
          step.description && step.images ? (
            <section
              key={step.number}
              className={styles.step}
              data-process-panel
              data-process-stacked={index > 0 || undefined}
              style={{ zIndex: index + 1 }}
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
                  <p className="font-sans text-[16px] leading-normal font-light text-text-on-light/80 md:text-[20px]">
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
                  <span
                    className="image-grain-overlay"
                    aria-hidden="true"
                    style={{
                      maskImage: `url("${step.images.botanical.src}")`,
                      maskSize: "contain",
                      maskPosition: "center",
                      maskRepeat: "no-repeat",
                    }}
                  />
                </div>
                <div className={styles.cuvees}>
                  <p className={styles.cuveesLabel}>Cuvées concernées</p>
                  <ul className={styles.cuveesList}>
                    {step.cuvees.map((cuvee) => <li key={cuvee}>{cuvee}</li>)}
                  </ul>
                </div>
              </div>
              <div className={`${styles.scene} image-grain`}>
                <Image
                  src={step.images.scene.src}
                  alt={step.images.scene.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
              <span className={styles.cover} data-process-shade aria-hidden="true" />
            </section>
          ) : null,
        )}
      </ProcessTransitions>
    </div>
  );
}
