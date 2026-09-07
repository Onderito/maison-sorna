import type { ReactNode } from "react";

import SiteNavigation from "@/components/site-navigation";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <><SiteNavigation />{children}</>;
}
