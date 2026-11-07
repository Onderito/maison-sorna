/** Present the merchant's preparation copy without inventing brewing advice. */
export function parseTeaPreparation(text: string) {
  const match = text.trim().match(/^(Au gaiwan|En théière|À froid)\s*:\s*([\s\S]+)$/iu);
  if (!match) return null;

  const instructions = match[2];
  const count = instructions.match(/(?:^|\s)((?:\d+(?:\s+à\s+\d+)?|une)\s+infusions?)\.?\s*$/iu);
  return {
    method: match[1],
    instructions: count ? instructions.slice(0, count.index).trim() : instructions,
    infusions: count?.[1] ?? null,
  };
}
