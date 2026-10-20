import Image from "next/image";
import styles from "./founders-section.module.css";

type Profile = {
  id: string;
  name: string;
  role?: string;
  paragraphs: string[];
};

type ProfilesSectionProps = {
  id: string;
  label: string;
  profiles: Profile[];
};

export default function ProfilesSection({ id, label, profiles }: ProfilesSectionProps) {
  return (
    <section id={id} className={styles.section} aria-label={label}>
      {profiles.map((profile) => (
        <article key={profile.id} className={styles.profile} aria-labelledby={`${profile.id}-title`}>
          <div className={styles.portrait}>
            <Image
              src="/figma/ressentir/fondateurs/portrait-provisoire.png"
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className={styles.image}
            />
          </div>
          <div className={styles.biography}>
            <div>
              <h2 id={`${profile.id}-title`} className={styles.name}>{profile.name},</h2>
              {profile.paragraphs.length > 0 && (
                <div className={styles.copy}>
                  {profile.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              )}
            </div>
            {profile.role && <p className={styles.role}>{profile.role}</p>}
            <div className={styles.editorialPhoto}>
              <Image
                src="/figma/ressentir/fondateurs/portrait-provisoire.png"
                alt=""
                fill
                sizes="(min-width: 1024px) 28vw, 1px"
                className={styles.image}
              />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
