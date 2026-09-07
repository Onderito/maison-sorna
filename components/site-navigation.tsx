import Image from "next/image";
import Link from "next/link";

import CustomerAccountLink from "@/components/customer-account-link";

const navigation = [
  { label: "Infuser", href: "/#infuser" },
  { label: "Appliquer", href: "/#appliquer" },
  { label: "Ressentir", href: "/#ressentir" },
] as const;

type SiteNavigationProps = {
  overlay?: boolean;
  tone?: "dark" | "light" | "auto";
};

export default function SiteNavigation({
  overlay = false,
  tone = "auto",
}: SiteNavigationProps) {
  const assets = tone === "light" ? "/figma/ressenti-hero" : "/figma/hero";
  const iconClass = tone === "auto" ? "dark:invert" : "";

  return (
    <header
      className={`z-20 flex w-[calc(100%-2rem)] max-w-[1569px] items-center justify-between md:w-[90.8%] ${
        overlay
          ? "absolute top-[clamp(1.5rem,4.57vh,3.1875rem)] left-1/2 -translate-x-1/2"
          : "relative mx-auto my-6 md:my-8"
      } ${tone === "light" ? "text-white" : tone === "dark" ? "text-[#211915]" : "text-foreground"}`}
    >
      <Link
        href="/"
        className="flex min-h-11 shrink-0 items-center font-display text-sm leading-none whitespace-nowrap uppercase transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none md:text-lg"
        aria-label="Maison Sörna, accueil"
      >
        Maison Sörna
      </Link>

      <nav
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 font-sans text-lg uppercase md:flex"
        aria-label="Navigation principale"
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex min-h-11 items-center transition-transform duration-200 after:absolute after:right-0 after:bottom-1.5 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:after:transition-none"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4 lg:gap-5">
        <button
          type="button"
          disabled
          title="Le changement de langue sera disponible ultérieurement"
          aria-label="Langue : français"
          className="flex min-h-11 min-w-11 items-center justify-center gap-1 font-sans text-sm md:text-lg"
        >
          Fr
          <Image src={`${assets}/chevron.svg`} alt="" width={10} height={5} className={`h-[5px] w-[10px] ${iconClass}`} />
        </button>

        <Link
          href="/panier"
          prefetch={false}
          aria-label="Voir le panier"
          title="Panier"
          className="flex size-11 items-center justify-center transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none"
        >
          <Image src={`${assets}/cart.svg`} alt="" width={18} height={18} className={`size-[18px] ${iconClass}`} />
        </Link>

        <CustomerAccountLink
          assets={assets}
          iconClass={iconClass}
          overlay={overlay}
        />
      </div>
    </header>
  );
}
