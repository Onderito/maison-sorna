import Image from "next/image";
import Link from "next/link";
import styles from "./site-footer.module.css";

const groups = [
  {
    title: "Infuser",
    links: [
      { label: "Le savoir faire", href: "/infuser#infuser" },
      { label: "La carte", href: "/infuser#la-carte" },
      { label: "Le rituel", href: "/infuser" },
      { label: "L’art de l’accord", href: "/infuser" },
    ],
  },
  {
    title: "Appliquer",
    links: [
      { label: "Le savoir faire", href: "/appliquer" },
      { label: "Nos crèmes", href: "/appliquer#le-second-versant" },
    ],
  },
  {
    title: "Ressentir",
    links: [
      { label: "Les origines", href: "/ressentir" },
      { label: "Le regard", href: "/ressentir" },
      { label: "À l’origine de la maison", href: "/ressentir" },
      { label: "Ceux qui font le reste", href: "/ressentir" },
    ],
  },
];

const linkClass = "w-fit underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export default function SiteFooter() {
  return (
    <footer id="footer" className={styles.footer} aria-label="Pied de page">
      <div className={styles.paper}>
        <div className={styles.columns}>
          <div className={styles.newsletter}>
            <label htmlFor="footer-email" className={styles.heading}>S’inscrire à notre newsletter</label>
            <div className={styles.email}>
              <input id="footer-email" type="email" autoComplete="email" placeholder="Votre adresse email" className="min-w-0 flex-1 bg-transparent px-0.5 placeholder:text-text-on-dark focus-visible:outline-2 focus-visible:outline-button" />
              <button type="button" disabled title="L’inscription à la newsletter sera bientôt disponible" aria-label="S’inscrire à la newsletter, bientôt disponible" className="h-full w-[48px] shrink-0 cursor-not-allowed bg-text-on-dark text-xl text-button">→</button>
            </div>
            <p className={styles.description}>Quelques nouvelles de SÖRNA, lorsque le moment est juste.</p>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className={`${styles.heading} uppercase`}>{group.title}</h2>
              <ul className={styles.links}>
                {group.links.map((link) => <li key={link.label}><Link href={link.href} className={`inline-block ${linkClass}`}>{link.label}</Link></li>)}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className={`${styles.heading} uppercase`}>Nos réseaux</h2>
            <ul className={styles.links}>
              <li><a href="https://www.instagram.com/sorna_fr/" target="_blank" rel="noopener noreferrer" className={`inline-block ${linkClass}`}>Instagram<span className="sr-only"> (nouvel onglet)</span></a></li>
              <li><a href="https://www.linkedin.com/company/maison-s%C3%B6rna/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className={`inline-block ${linkClass}`}>LinkedIn<span className="sr-only"> (nouvel onglet)</span></a></li>
            </ul>
          </div>
        </div>
        <div className={styles.legal}>
          <span>Mentions légales</span>
          <span>CGV</span>
          <div className="text-right">
            <span>Confidentialité</span>
            <p className={styles.copyright}>© 2026</p>
          </div>
        </div>
      </div>
      <div className={`${styles.photo} image-grain`}>
        <Image src="/figma/footer/window.png" alt="Une fenêtre ouverte sur les collines, éclairée par une lumière dorée." fill sizes="100vw" className="object-cover" />
        <p className={styles.signature}>SÖRNA</p>
      </div>
    </footer>
  );
}
