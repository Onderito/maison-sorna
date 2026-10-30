import { describe, expect, it } from "vitest";
import { parseTeaDescription } from "./tea-description";

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
      harvest: "de printemps, bourgeons seuls", oxidation: "complète", roasting: "aucune",
    });
    expect(result.sections[0].blocks[0].text).toBe("Un style né en 2005 à Tongmu.");
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
