import type { TeaDescriptionBlock, TeaDescriptionSection } from "@/app/lib/shopify/tea-description";
import styles from "./tea-card.module.css";

function Blocks({ blocks }: { blocks: TeaDescriptionBlock[] }) {
  const groups: { kind: TeaDescriptionBlock["kind"]; texts: string[] }[] = [];
  for (const block of blocks) {
    const previous = groups.at(-1);
    if (block.kind === "list-item" && previous?.kind === "list-item") previous.texts.push(block.text);
    else groups.push({ kind: block.kind, texts: [block.text] });
  }
  return groups.map((group, index) => group.kind === "list-item"
    ? <ul key={index}>{group.texts.map((text, item) => <li key={item}>{text}</li>)}</ul>
    : <p key={index}>{group.texts[0]}</p>);
}

export default function TeaProductDescription({ sections }: { sections: TeaDescriptionSection[] }) {
  if (!sections.length) return null;
  return <div className={styles.description}>
    {sections.map((section, index) => {
      // Keep the introduction and tasting notes visible; practical information
      // stays one click away without making the initial label overwhelming.
      if (!section.title || /^notes de dégustation$/i.test(section.title)) {
        return <section key={index} className={styles.descriptionSection}>
          {section.title && <h3>{section.title}</h3>}
          <Blocks blocks={section.blocks} />
        </section>;
      }
      return <details key={index} className={styles.descriptionDisclosure}>
        <summary><span>{/^la cuvée$/i.test(section.title) ? "Le cru" : section.title}</span><span className={styles.disclosureMark} aria-hidden="true">+</span></summary>
        <div className={styles.descriptionSection}><Blocks blocks={section.blocks} /></div>
      </details>;
    })}
  </div>;
}
