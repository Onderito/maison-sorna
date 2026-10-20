import type { ReactNode } from "react";
import SiteNavigation from "@/components/site-navigation";

export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-text-on-light">
      <SiteNavigation tone="dark" />
      {children}
    </div>
  );
}
