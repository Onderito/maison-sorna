import type { ReactNode } from "react";
import SiteNavigation from "@/components/site-navigation";

export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <div className="paper-background min-h-screen text-[#211915]">
      <SiteNavigation tone="dark" />
      {children}
    </div>
  );
}
