"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  useAnimationControls,
  useInView,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";

const EntranceContext = createContext<{
  controls: ReturnType<typeof useAnimationControls>;
} | null>(null);

export const photoRevealInset = "65% 70% 0% 0%";

const photoTransition: Transition = {
  duration: 1.2,
  delay: 0.1,
  ease: [0.77, 0, 0.175, 1],
};

export function useTeaCardEntrance() {
  const entrance = useContext(EntranceContext);
  if (!entrance)
    throw new Error("La carte doit être placée dans TeaCardEntrance.");
  return entrance;
}

export const contentEntrance: Variants = {
  entranceHidden: { opacity: 0, transform: "translateY(6px)" },
  entranceVisible: {
    opacity: 1,
    transform: "translateY(0px)",
    // The image starts at 0.1s; all label content follows 0.2s later.
    transition: { duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
  entranceImmediate: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0 } },
};

export const photoEntrance: Variants = {
  entranceHidden: { clipPath: `inset(${photoRevealInset})`, opacity: 1 },
  entranceVisible: {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    transition: photoTransition,
  },
  entranceImmediate: {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    transition: { duration: 0 },
  },
};

export const photoZoomEntrance: Variants = {
  entranceHidden: { transform: "scale(1.12)" },
  entranceVisible: { transform: "scale(1)", transition: photoTransition },
  entranceImmediate: { transform: "scale(1)", transition: { duration: 0 } },
};

export default function TeaCardEntrance({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className: string;
  id: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useRef(false);
  const controls = useAnimationControls();
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      revealed.current = true;
      controls.stop();
      controls.set("entranceImmediate");
    } else if (!revealed.current) {
      if (inView) {
        revealed.current = true;
        void controls.start("entranceVisible");
      } else controls.set("entranceHidden");
    }
  }, [controls, inView, reducedMotion]);

  return (
    <EntranceContext.Provider value={{ controls }}>
      <section
        ref={sectionRef}
        id={id}
        data-cru={id}
        className={className}
        aria-labelledby={`tea-${id}-title`}
        onFocusCapture={(event) => {
          if (!event.target.matches(":focus-visible")) return;
          revealed.current = true;
          controls.stop();
          controls.set("entranceImmediate");
        }}
      >
        {children}
      </section>
    </EntranceContext.Provider>
  );
}
