import Image from "next/image";
import styles from "./founders-section.module.css";
import ProfileReveal from "./profile-reveal";

type Profile = {
  id: string;
  name: string;
  role?: string;
  portraitSrc?: string;
  editorialSrc?: string;
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
        <ProfileReveal key={profile.id} className={styles.profile} aria-labelledby={`${profile.id}-title`}>
          <div className={styles.portrait} data-profile-portrait>
            <Image
              src={profile.portraitSrc ?? "/figma/ressentir/fondateurs/portrait-provisoire.png"}
              alt={profile.portraitSrc ? `Portrait de ${profile.name} dans les vignes` : ""}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className={styles.image}
            />
          </div>
          <div className={styles.biography} data-profile-biography>
            <div>
              <h2 id={`${profile.id}-title`} className={styles.name}>
                <span className={styles.nameMask}><span data-profile-name>{profile.name},</span></span>
              </h2>
              {profile.paragraphs.length > 0 && (
                <div className={styles.copy}>
                  {profile.paragraphs.map((paragraph) => <p key={paragraph} data-profile-paragraph>{paragraph}</p>)}
                </div>
              )}
            </div>
            {profile.role && <p className={styles.role} data-profile-role>{profile.role}</p>}
            <div className={styles.editorialPhoto} data-profile-editorial>
              <Image
                src={profile.editorialSrc ?? "/figma/ressentir/fondateurs/portrait-provisoire.png"}
                alt=""
                fill
                sizes="(min-width: 1024px) 28vw, 1px"
                className={styles.image}
                style={profile.editorialSrc ? { objectPosition: "center top" } : undefined}
              />
            </div>
          </div>
        </ProfileReveal>
      ))}
    </section>
  );
}
