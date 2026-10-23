import ProfilesSection from "./profiles-section";

const contributors = [
  {
    id: "suzie",
    name: "Suzie",
    role: "DIRECTION ARTISTIQUE & COMMUNICATION",
    paragraphs: [
      "J’ai lancé Solumia, un projet né de l’envie de réunir la communication digitale et la gastronomie, deux univers qui me passionnent.",
      "J’ai choisi d’accompagner SÖRNA parce que je me retrouve dans cette façon de faire découvrir le thé autrement, à travers une sélection de grands crus botaniques.",
      "Mon rôle est de mettre tout cela en lumière par la direction artistique, la création de contenus photo et vidéo et le développement des réseaux sociaux, en gardant une communication humaine et fidèle à l’univers de SÖRNA.",
    ],
  },
  {
    id: "alice",
    name: "Alice",
    paragraphs: ["Texte à recevoir."],
  },
  {
    id: "alex",
    name: "Alex",
    role: "PHOTOGRAPHE & VIDÉASTE",
    paragraphs: [
      "Je viens de Cosne-sur-Loire. Avant d’en arriver là, j’ai surtout travaillé dans le bâtiment et dans la vente.",
      "Capturer de belles images, en photo comme en vidéo, est une passion découverte par hasard. C’est devenu ce que je fais aujourd’hui.",
      "SÖRNA, en revanche, ce n’est pas un hasard. Je connais personnellement le fondateur, et j’ai eu envie de suivre le projet. Ce qui m’attire dans ce projet, c’est le côté naturel de tout ce qui l’entoure, et la vision qui le porte.",
    ],
  },
  {
    id: "ulas",
    name: "Ulas",
    role: "DESIGNER & DÉVELOPPEUR",
    paragraphs: [
      "À mon compte depuis un an, avec l’objectif simple de choisir les projets qui me font vibrer.",
      "J’ai toujours voulu porter un projet de A à Z, de l’idée jusqu’au développement, parce que c’est là que je peux apporter toute la dimension créative qui me tient à cœur.",
      "C’est pour ça que j’ai choisi d’accompagner SÖRNA. Faire découvrir le thé autrement, c’est un projet qui me parle profondément.",
    ],
  },
];

export default function ContributorsSection() {
  return <ProfilesSection id="les-contributeurs" label="Ceux qui l’accompagnent" profiles={contributors} />;
}
