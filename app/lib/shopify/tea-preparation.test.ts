import { describe, expect, it } from "vitest";
import { parseTeaPreparation } from "./tea-preparation";

describe("parseTeaPreparation", () => {
  it("exposes Shopify's infusion count once, preserving the complete brewing recipe", () => {
    expect(parseTeaPreparation("Au gaiwan : 7 g pour 10 cl, eau à 100 °C. Rinçage 5 secondes, puis 10 secondes et 5 secondes de plus à chaque infusion. 10 à 15 infusions.")).toEqual({
      method: "Au gaiwan",
      instructions: "7 g pour 10 cl, eau à 100 °C. Rinçage 5 secondes, puis 10 secondes et 5 secondes de plus à chaque infusion.",
      infusions: "10 à 15 infusions",
    });
  });
  it("preserves single infusions and never invents missing counts", () => {
    expect(parseTeaPreparation("À froid : 8 g par litre. Une infusion.")).toEqual({ method: "À froid", instructions: "8 g par litre.", infusions: "Une infusion" });
    expect(parseTeaPreparation("En théière : eau à 85 °C.")?.infusions).toBeNull();
  });
  it("leaves unfamiliar merchant text available for the normal renderer", () => {
    expect(parseTeaPreparation("Réinfuser selon votre goût.")).toBeNull();
    expect(parseTeaPreparation("Au gaiwan : 3 infusions, puis adapter à votre goût.")).toEqual({ method: "Au gaiwan", instructions: "3 infusions, puis adapter à votre goût.", infusions: null });
  });
});
