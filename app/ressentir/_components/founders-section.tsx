import ProfilesSection from "./profiles-section";

const founders = [
  {
    id: "julien",
    name: "Julien",
    role: "Fondateur",
    paragraphs: [
      "Ce qui m’anime, c’est le vin. Et le champagne surtout, qui est sans doute le vin où le lieu compte le plus et où l’on triche le moins.",
      "Je n’ai pas de formation dans le vin. J’ai appris en buvant, en lisant, en comparant. Le thé est arrivé de la même manière. Je l’ai goûté comme je goûtais un vin : en cherchant le lieu derrière ce que j’avais dans la tasse.",
    ],
  },
  {
    id: "antoine",
    name: "Antoine",
    role: "Associé",
    paragraphs: [
      "31 ans et je viens de Sancerre, où j’ai grandi. Pendant 12 ans, j’ai travaillé comme ouvrier viticole, un métier qui m’a appris la patience, le respect du geste juste et l’exigence du travail bien fait, dans le respect de la terre et des saisons.",
      "J’ai rejoint Maison Sorna parce que j’y ai retrouvé ces mêmes valeurs : l’authenticité, le naturel et l’exigence de la qualité.",
    ],
  },
];

export default function FoundersSection() {
  return <ProfilesSection id="les-fondateurs" label="Les fondateurs de la Maison" profiles={founders} />;
}
