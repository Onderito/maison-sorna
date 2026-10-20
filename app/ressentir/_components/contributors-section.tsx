import ProfilesSection from "./profiles-section";

const contributors = [
  {
    id: "suzie",
    name: "Suzie",
    role: "DIRECTION ARTISTIQUE & COMMUNICATION",
    paragraphs: [
      "24 ans et j’ai récemment lancé Solumia, un projet né de mon envie de réunir deux univers qui me passionnent : la communication digitale et la gastronomie.",
      "J’ai choisi d’accompagner Maison SÖRNA parce que je me retrouve particulièrement dans ce projet de faire découvrir le thé autrement, à travers une sélection de grands crus botaniques.",
      "Mon rôle est de mettre tout ça en lumière à travers la direction artistique, la création de contenus photo et vidéo et le développement des réseaux sociaux, tout en gardant une communication humaine et fidèle à l’univers de SÖRNA.",
    ],
  },
  {
    id: "alice",
    name: "Alice",
    paragraphs: [],
  },
  {
    id: "alex",
    name: "Alex",
    role: "PHOTOGRAPHE & VIDÉASTE",
    paragraphs: [
      "Je viens de Cosne sur Loire et, avant d’en arriver là, j’ai travailler principalement dans le bâtiment ou la vente.",
      "Ce qui m’a amené à faire ce que je fais aujourd’hui, capturer des belles images que ce soit en photo ou en videos, cela viens d’un passion découverte par hasard.",
      "J’ai découvert SÖRNA non pas par hasard mais parce que je connais personnellement le fondateur et j’ai eu envie de suivre le projet. Ce qui m’intéresse particulièrement dans SÖRNA c’est le coter naturel de tout ce qui entour ce projet et la visions de ce dernier.",
    ],
  },
  {
    id: "ulas",
    name: "Ulas",
    role: "DESIGNER & DÉVELOPPEUR",
    paragraphs: [
      "26 ans. Lancé à mon compte depuis un an, avec un objectif simple : choisir les projets qui me font vibrer.",
      "J'ai toujours voulu porter un projet de A à Z, de l'idée jusqu'au développement, parce que c'est là que je peux apporter toute la dimension créative qui me tient à cœur.",
      "C'est exactement pour ça que j'ai choisi d'accompagner la maison Sörna. Faire découvrir le thé d'une autre façon, c'est un projet qui me parle profondément",
    ],
  },
];

export default function ContributorsSection() {
  return <ProfilesSection id="les-contributeurs" label="Ceux qui font le reste" profiles={contributors} />;
}
