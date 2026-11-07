"use client";

import type { TeaDescriptionBlock, TeaDescriptionSection } from "@/app/lib/shopify/tea-description";
import styles from "./tea-card.module.css";
import { parseTeaPreparation } from "@/app/lib/shopify/tea-preparation";
import ProductProfessionalLink from "@/components/product-professional-link";

export function TeaDescriptionBlocks({ blocks }: { blocks: TeaDescriptionBlock[] }) {
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

function TeaPreparation({ blocks }: { blocks: TeaDescriptionBlock[] }) {
  return <div className={styles.preparationMethods}>
    {blocks.map((block, index) => {
      const preparation = parseTeaPreparation(block.text);
      if (!preparation) return <TeaDescriptionBlocks key={index} blocks={[block]} />;
      return <section key={index} className={styles.preparationMethod}>
        <div className={styles.preparationHeading}>
          <h4>{preparation.method}</h4>
          {preparation.infusions && <p className={styles.infusionCount}>{preparation.infusions}</p>}
        </div>
        {preparation.instructions && <p>{preparation.instructions}</p>}
      </section>;
    })}
  </div>;
}

export default function TeaProductDescription({ sections }: { sections: TeaDescriptionSection[] }) {
  return <div className={styles.description}>
    {sections.map((section, index) => {
      // Any introductory copy stays visible; practical information is folded.
      if (!section.title || /^notes de dégustation$/i.test(section.title)) {
        return <section key={index} className={styles.descriptionSection}>
          {section.title && <h3>{section.title}</h3>}
          <TeaDescriptionBlocks blocks={section.blocks} />
        </section>;
      }
      const isPreparation = /^conseils de préparation$/i.test(section.title.trim());
      return <details key={index} className={styles.descriptionDisclosure}>
        <summary><span>{isPreparation ? "Infusions & préparation" : /^la cuvée$/i.test(section.title) ? "Le cru" : section.title}</span><span className={styles.disclosureMark} aria-hidden="true">+</span></summary>
        <div className={styles.descriptionSection}>{isPreparation ? <TeaPreparation blocks={section.blocks} /> : <TeaDescriptionBlocks blocks={section.blocks} />}</div>
      </details>;
    })}
    <details className={styles.descriptionDisclosure} onToggle={(event) => {
      const disclosure = event.currentTarget;
      if (!disclosure.open) return;
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      const dialogScroll = disclosure.closest<HTMLElement>("[data-product-scroll]");
      if (dialogScroll) {
        // Mobile scrolls the complete sheet, including the photograph.
        const scrollContainer = matchMedia("(max-width: 767px)").matches
          ? disclosure.closest<HTMLElement>("[data-product-sheet]") ?? dialogScroll
          : dialogScroll;
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior });
      } else {
        // A standalone fiche can also need the page to move into view.
        disclosure.scrollIntoView({ block: "nearest", behavior });
      }
    }}>
      <summary><span>Vous êtes professionnel ?</span><span className={styles.disclosureMark} aria-hidden="true">+</span></summary>
      <div className={styles.descriptionSection}><ProductProfessionalLink /></div>
    </details>
  </div>;
}
