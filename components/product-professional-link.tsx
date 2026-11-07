import Link from "next/link";
import ArrowRight from "./arrow-right";
import styles from "./product-professional-link.module.css";

export default function ProductProfessionalLink() {
  return (
    <aside className={styles.invitation} aria-label="Pour les professionnels">
      <p className={styles.copy}>Vous êtes restaurateur, hôtelier ou professionnel du goût ? Découvrez notre accompagnement pour votre établissement.</p>
      <Link href="/recevoir" className={styles.link}>
        Découvrir l’espace professionnel <ArrowRight />
      </Link>
    </aside>
  );
}
