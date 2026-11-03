export const infuserNavigationLinks = [
  { label: "Les cinq crus", href: "/infuser#les-cuvees" },
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

export const recevoirNavigationLinks = [
  { label: "Pourquoi SÖRNA", href: "/recevoir#pourquoi-sorna" },
  { label: "L’art de l’accord", href: "/recevoir#l-art-de-l-accord" },
  { label: "Du matin au soir", href: "/recevoir#du-matin-au-soir" },
  { label: "Goûtons ensemble", href: "/recevoir#degustation" },
  { label: "Faisons connaissance", href: "/recevoir#demande" },
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
  if (href === "/recevoir") return recevoirNavigationLinks;
  if (href === "/ressentir") return ressentirNavigationLinks;
  return undefined;
}
