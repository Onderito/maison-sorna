import Image from "next/image";
import type { ReactNode } from "react";
import SeamlessBackgroundVideo from "@/components/seamless-background-video";

const steps = [
  { label: "01- Infuser", href: "#infuser" },
  { label: "02 - Appliquer", href: "#appliquer" },
  { label: "03 - Ressentir", href: "#ressentir" },
] as const;

const defaultVideoSrc =
  "https://cdn.midjourney.com/video/28e7d9a1-b59d-428a-9dbf-36c54f242edd/0.mp4";

type RessentirSliderProps = {
  /** Replaces the video with a custom background element. */
  children?: ReactNode;
  className?: string;
  discoverHref?: string;
  videoFadeDuration?: number;
  videoSrc?: string;
};

export function RessentirSlider({
  children,
  className = "",
  discoverHref = "#decouvrir",
  videoFadeDuration = 1.2,
  videoSrc = defaultVideoSrc,
}: RessentirSliderProps) {
  return (
    <section
      id="ressentir"
      className={`relative isolate min-h-[100svh] overflow-hidden bg-[#18150f] text-text-on-dark ${className}`}
      aria-label="Ressentir"
    >
      <div
        className="absolute inset-0 -z-20 overflow-hidden [&>*]:size-full"
        aria-hidden="true"
      >
        {children ?? (
          <SeamlessBackgroundVideo
            fadeDuration={videoFadeDuration}
            src={videoSrc}
          />
        )}
      </div>

      <div
        className="absolute top-1/2 left-[clamp(1rem,1.5vw,1.625rem)] flex -translate-y-1/2 flex-col gap-3"
        aria-hidden="true"
      >
        {[false, false, true].map((isActive, index) => (
          <span
            key={index}
            className={`block size-[10px] rotate-45 border-[0.5px] border-white ${
              isActive ? "bg-white" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[4.71deg]">
        <a
          href={discoverHref}
          className="group relative block h-[clamp(11.875rem,21.49vw,15rem)] w-[clamp(9.25rem,10.88vw,11.75rem)] border-2 border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label="Découvrir Ressentir"
        >
          <Image
            src="/figma/ressentir/discover-card.png"
            alt=""
            fill
            sizes="(max-width: 768px) 148px, 188px"
            className="object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.04] group-active:scale-[0.96]"
          />
          <span className="absolute inset-0 flex items-center justify-center font-sans text-base font-light whitespace-nowrap text-text-on-dark md:text-xl">
            Découvrir →
          </span>
        </a>
      </div> */}

      <nav
        className="absolute right-1/2 bottom-[clamp(1.75rem,4.2vh,2.9375rem)] grid w-[calc(100%-2rem)] max-w-[1528px] translate-x-1/2 grid-cols-3 items-center font-display text-[clamp(1rem,3.24vw,3.5rem)] leading-normal whitespace-nowrap md:w-[88.4%]"
        aria-label="Étapes de l’expérience Maison Sörna"
      >
        {steps.map((step, index) => {
          const isActive = index === 2;

          return (
            <a
              key={step.href}
              href={step.href}
              className={`min-h-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:scale-[0.96] ${
                index === 0
                  ? "text-left"
                  : index === 1
                    ? "text-center"
                    : "text-right"
              } ${isActive ? "text-text-on-dark" : "text-text-on-dark/60"}`}
              aria-current={isActive ? "step" : undefined}
            >
              {step.label}
            </a>
          );
        })}
      </nav>
    </section>
  );
}

export default RessentirSlider;
