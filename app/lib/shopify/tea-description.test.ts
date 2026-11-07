import { describe, expect, it } from "vitest";
import { getTeaCollectionDescription, parseTeaDescription } from "./tea-description";

describe("parseTeaDescription", () => {
  it("récupère la cuvée, le terroir et la récolte réels sans les confondre avec le récit", () => {
    const result = parseTeaDescription(`
      <p><strong>Cuvée IV · Millésime 2026 · Thé noir · Jin Jun Mei · Village d’Aotou, Chine</strong></p>
      <p>Un style né en 2005 à Tongmu.</p>
      <h2>La cuvée</h2><ul>
      <li>Terroir : village d’Aotou, Jianyang, Fujian, Chine.</li>
      <li>Millésime : 2026, récolte de printemps, bourgeons seuls.</li>
      <li>Oxydation : complète.</li><li>Torréfaction : aucune.</li></ul>`);
    expect(result).toMatchObject({
      cuvee: "IV", teaType: "Thé noir", vintage: "2026",
      origin: "village d’Aotou, Jianyang, Fujian, Chine",
      originSummary: "Village d’Aotou, Chine",
      harvest: "de printemps, bourgeons seuls", oxidation: "complète", roasting: "aucune",
    });
    expect(result.sections[0].blocks[0].text).toBe("Un style né en 2005 à Tongmu.");
  });

  it("uses the merchant's short origin without losing the detailed terroir", () => {
    const result = parseTeaDescription(`<p>Cru IV · Millésime 2026 · Thé noir · Jin Jun Mei · Village d’Aotou, Chine</p><h2>Le cru</h2><p>Terroir : Village d’Aotou, Jianyang, Fujian, Chine, en bordure de la réserve de Tongmu, vers 1000 m.</p>`);
    expect(result.originSummary).toBe("Village d’Aotou, Chine");
    expect(result.origin).toContain("vers 1000 m");
    expect(parseTeaDescription("<h2>Le cru</h2><p>Origine : Fujian, Chine.</p>").originSummary).toBe("Fujian, Chine");
  });

  it("lit les titres collés en gras et les spans de l’éditeur Shopify", () => {
    const result = parseTeaDescription(`
      <p><strong><span>Cuvée V · Oolong de roche · Monts Wuyi, Fujian, Chine</span></strong></p>
      <p><strong><span>Notes de dégustation</span></strong></p>
      <p>Cannelle, pierre chaude &amp; fruits noirs.</p>
      <p><strong>La cuvée</strong></p>
      <ul><li><span>Terroir : monts Wuyi, Fujian, Chine.</span></li>
      <li>Oxydation : partielle.</li><li>Torréfaction : lente, au charbon, puis repos.</li></ul>
      <p><strong>Conseils de préparation</strong></p>
      <ul><li><strong>Au gaiwan :</strong> 7 g pour 10 cl, à 100 &#176;C.</li></ul>`);
    expect(result).toMatchObject({ cuvee: "V", teaType: "Oolong de roche", vintage: null, harvest: null });
    expect(result.sections.map((section) => section.title)).toEqual([
      "Notes de dégustation", "La cuvée", "Conseils de préparation",
    ]);
    expect(result.sections[0].blocks[0].text).toBe("Cannelle, pierre chaude & fruits noirs.");
    expect(result.sections[2].blocks[0]).toEqual({ kind: "list-item", text: "Au gaiwan : 7 g pour 10 cl, à 100 °C." });
  });

  it("préserve une description libre et les rubriques supplémentaires du marchand", () => {
    const result = parseTeaDescription('<p>Un thé de printemps.</p><h3>Notre producteur</h3><p>Un récit inédit.</p>');
    expect(result.cuvee).toBeNull();
    expect(result.sections).toEqual([
      { title: "", blocks: [{ kind: "paragraph", text: "Un thé de printemps." }] },
      { title: "Notre producteur", blocks: [{ kind: "paragraph", text: "Un récit inédit." }] },
    ]);
  });

  it("ignore les scripts, styles et attributs et ne renvoie que du texte", () => {
    const result = parseTeaDescription('<style>body{display:none}</style><script>alert(1)</script><p onclick="alert(2)">Thé <em>blanc</em><br>nature.</p><iframe>Ignorer</iframe>');
    expect(result.sections).toEqual([
      { title: "", blocks: [{ kind: "paragraph", text: "Thé blanc nature." }] },
    ]);
  });

  it("n’invente pas d’informations si la description est vide ou incomplète", () => {
    const empty = parseTeaDescription("");
    expect(empty).toMatchObject({ cuvee: null, origin: null, vintage: null, harvest: null, sections: [] });
    expect(parseTeaDescription("", "Présentation simple.").sections[0].blocks[0].text).toBe("Présentation simple.");
  });
});

describe("getTeaCollectionDescription", () => {
  it("keeps the opening idea and tasting notes without preparation or technical facts", () => {
    const { sections } = parseTeaDescription(`<p>Cuvée I · Thé blanc</p><p>Un thé blanc floral. Longuement flétri puis séché.</p><h2>Notes de dégustation</h2><p>Pivoine, miel et amande. Une douceur sans amertume.</p><h2>Conseils de préparation</h2><p>Eau à 85 °C.</p>`);
    expect(getTeaCollectionDescription(sections)).toBe("Un thé blanc floral. Pivoine, miel et amande.");
  });
  it("does not invent missing copy or repeat tasting notes", () => {
    expect(getTeaCollectionDescription([])).toBe("");
    expect(getTeaCollectionDescription(parseTeaDescription("<p>Miel et amande.</p><h2>Notes de dégustation</h2><p>Miel et amande.</p>").sections)).toBe("Miel et amande.");
  });
});
