import ProfilesSection from "./profiles-section";

const founders = [
  {
    id: "julien",
    name: "Julien",
    role: "Fondateur",
    portraitSrc: "/figma/ressentir/fondateurs/julien-portrait.png",
    editorialSrc: "/figma/ressentir/fondateurs/julien-vignes.png",
    paragraphs: [
      "J’ai grandi à Sancerre, au milieu des vignes, et le vin ne m’a jamais quitté. Le champagne surtout. Je ne l’ai pas étudié. J’ai appris en goûtant, en lisant, en comparant, avec toujours la même question. D’où vient ce que j’ai dans mon verre ?",
      "Le thé est arrivé de la même manière. Je l’ai goûté comme je goûtais un vin, en cherchant le lieu derrière ce que j’avais dans la tasse. SÖRNA vient de là. Aujourd’hui encore, je prépare moi-même chaque commande.",
    ],
  },
  {
    id: "antoine",
    name: "Antoine",
    role: "Associé",
    paragraphs: [
      "Je viens de Sancerre, où j’ai grandi. Pendant douze ans, j’ai été ouvrier viticole. La taille, les vendanges, et entre les deux, des milliers de gestes répétés, pied après pied.",
      "La vigne m’a appris la patience et la précision. J’ai rejoint SÖRNA parce que j’y ai retrouvé cette exigence de partir de ce que la terre donne, et d’accorder du soin à chaque geste.",
    ],
  },
];

export default function FoundersSection() {
  return <ProfilesSection id="les-fondateurs" label="Les fondateurs de la Maison" profiles={founders} />;
}
