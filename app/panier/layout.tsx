import type { ReactNode } from "react";
import SiteNavigation from "@/components/site-navigation";

export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNavigation />
      {children}
    </>
  );
}
