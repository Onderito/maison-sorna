import { parseDocument } from "htmlparser2";

type HtmlNode = ReturnType<typeof parseDocument>["children"][number];

export type TeaDescriptionBlock = {
  kind: "paragraph" | "list-item";
  text: string;
};

export type TeaDescriptionSection = {
  title: string;
  blocks: TeaDescriptionBlock[];
};

const sectionTitles = new Set([
  "notes de degustation", "la cuvee", "conseils de preparation",
  "format et composition", "conservation",
]);

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function nodeText(node: HtmlNode): string {
  if (node.type === "text") return node.data;
  if ("name" in node && ["script", "style", "iframe", "template"].includes(node.name)) return "";
  if ("name" in node && node.name === "br") return " ";
  return "children" in node ? node.children.map(nodeText).join("") : "";
}

// Read the merchant's headings and paragraphs as text. No Shopify HTML or
// attributes are injected into the page, including pasted spans and styles.
export function parseTeaDescription(html: string, fallback = "") {
  const blocks: { kind: TeaDescriptionBlock["kind"] | "heading"; text: string }[] = [];
  function visit(nodes: HtmlNode[]) {
    for (const node of nodes) {
      if (node.type === "text") {
        const text = node.data.replace(/\s+/g, " ").trim();
        if (text) blocks.push({ kind: "paragraph", text });
      } else if ("name" in node) {
        if (["script", "style", "iframe", "template"].includes(node.name)) continue;
        if (/^(p|li|h[1-6])$/.test(node.name)) {
          const text = nodeText(node).replace(/\s+/g, " ").trim();
          if (text) blocks.push({
            kind: /^h[1-6]$/.test(node.name) || sectionTitles.has(normalize(text))
              ? "heading" : node.name === "li" ? "list-item" : "paragraph",
            text,
          });
        } else if ("children" in node) visit(node.children);
      }
    }
  }
  visit(parseDocument(html).children);
  if (!blocks.length && fallback.trim()) blocks.push({ kind: "paragraph", text: fallback.trim() });

  const metadata = blocks[0]?.text.match(/^Cuvée\s+([IVX]+|\d+)\s*(?:·|$)/i);
  const subtitle = metadata ? blocks.shift()!.text : "";
  const sections: TeaDescriptionSection[] = [];
  let current: TeaDescriptionSection = { title: "", blocks: [] };
  for (const block of blocks) {
    if (block.kind === "heading") {
      if (current.blocks.length) sections.push(current);
      current = { title: block.text, blocks: [] };
    } else current.blocks.push({ kind: block.kind, text: block.text });
  }
  if (current.blocks.length) sections.push(current);

  const facts = sections.find((section) => normalize(section.title) === "la cuvee")?.blocks ?? [];
  function fact(label: string) {
    const block = facts.find((item) => normalize(item.text.split(":")[0]) === label);
    return block?.text.slice(block.text.indexOf(":") + 1).trim().replace(/\.$/, "") ?? null;
  }
  const vintageText = fact("millesime") ?? subtitle.split("·").find((part) => /millésime/i.test(part)) ?? "";
  const vintage = vintageText.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? null;
  const harvest = fact("recolte") ?? vintageText.match(/récolte\s+(.*)/i)?.[1]?.replace(/\.$/, "") ?? null;
  const teaType = subtitle.split("·").map((part) => part.trim()).find((part) => /^(thé|oolong)(?:\s|$)/i.test(part)) ?? null;

  return {
    cuvee: metadata?.[1] ?? null,
    teaType,
    origin: fact("terroir") ?? fact("origine"),
    vintage,
    harvest,
    oxidation: fact("oxydation"),
    roasting: fact("torrefaction"),
    sections,
  };
}
