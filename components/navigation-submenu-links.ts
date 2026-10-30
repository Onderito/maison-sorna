export const infuserNavigationLinks = [
  { label: "Les cinq cuvées", href: "/infuser#les-cuvees" },
  { label: "Le geste", href: "/infuser#le-geste" },
  { label: "Questions fréquentes", href: "/infuser#faq" },
] as const;

export const ressentirNavigationLinks = [
  { label: "Les origines", href: "/ressentir#les-origines" },
  { label: "Le regard", href: "/ressentir#le-regard" },
  { label: "La preuve", href: "/ressentir#la-preuve" },
  { label: "À l’origine de la Maison", href: "/ressentir#a-l-origine-de-la-maison" },
  { label: "Ceux qui l’accompagnent", href: "/ressentir#ceux-qui-l-accompagnent" },
] as const;

export const footerNavigationGroups = [
  { title: "Infuser", links: infuserNavigationLinks },
  { title: "Appliquer", links: [
    { label: "Le second versant", href: "/appliquer#le-second-versant" },
  ] },
  { title: "Ressentir", links: ressentirNavigationLinks },
] as const;

export function getNavigationSubmenuLinks(href: string) {
  if (href === "/infuser") return infuserNavigationLinks;
  if (href === "/ressentir") return ressentirNavigationLinks;
  return undefined;
}
