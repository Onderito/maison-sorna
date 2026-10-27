"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useProfileReveal } from "@/animations/use-profile-reveal";

export default function ProfileReveal(props: ComponentPropsWithoutRef<"article">) {
  const { profileRef } = useProfileReveal();
  return <article {...props} ref={profileRef} />;
}
