import type { ReactNode } from "react";

import SiteNavigation from "@/components/site-navigation";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#e9e2d6] text-[#211915]"><SiteNavigation tone="dark" />{children}</div>;
}
