export type ProcessImage = {
  src: string;
  alt: string;
};

export type ProcessStep = {
  number: number;
  title: string;
  description: string | null;
  cuvees: readonly string[];
  images: {
    botanical: ProcessImage;
    scene: ProcessImage;
  } | null;
};

export const processSteps: readonly [
  ProcessStep,
  ProcessStep,
  ProcessStep,
  ProcessStep,
  ProcessStep,
] = [
  {
    number: 1,
    title: "Récolte",
    cuvees: ["Pivoine Royale", "Brume des Cimes", "Écorce de Feu", "Miel d’Orchidée", "Sourcil d’Or"],
    description:
      "Bourgeons seuls ou feuilles plus mûres : chaque cru appelle sa propre cueillette. Au printemps, le choix de la pousse et du moment donne au thé son premier caractère.",
    images: {
      botanical: {
        src: "/figma/infuser/process/01-illu.webp",
        alt: "Jeunes feuilles de thé sur leur tige",
      },
      scene: {
        src: "/figma/infuser/process/recolte.png",
        alt: "Récolte à la main de jeunes feuilles de thé",
      },
    },
  },
  {
    number: 2,
    title: "Flétrissage",
    cuvees: ["Pivoine Royale", "Écorce de Feu", "Miel d’Orchidée", "Sourcil d’Or"],
    description:
      "Étalées sur des claies, les feuilles perdent une part de leur eau et s’assouplissent. Premier geste après la cueillette pour la plupart de nos crus, le flétrissage est presque tout le travail de Pivoine Royale : un long repos à l’air, puis un séchage. Deux gestes seulement, pour préserver la délicatesse du thé blanc.",
    images: {
      botanical: {
        src: "/figma/infuser/process/02-illu.webp",
        alt: "Feuille de thé assouplie par le flétrissage",
      },
      scene: {
        src: "/figma/infuser/process/02.webp",
        alt: "Feuilles de thé étalées pendant le flétrissage",
      },
    },
  },
  {
    number: 3,
    title: "Oxydation",
    cuvees: ["Écorce de Feu", "Miel d’Orchidée", "Sourcil d’Or"],
    description:
      "Au contact de l’air, la feuille brunit comme une pomme coupée, et ses arômes se transforment. Pour les oolongs Écorce de Feu et Miel d’Orchidée, les feuilles sont brassées, puis l’oxydation est arrêtée en cours de route. Pour le thé noir Sourcil d’Or, elle est menée jusqu’au bout. C’est elle qui donne à chaque cru sa couleur et une grande part de son goût.",
    images: {
      botanical: {
        src: "/figma/infuser/process/03-illu.webp",
        alt: "Feuille de thé en cours d’oxydation",
      },
      scene: {
        src: "/figma/infuser/process/03.webp",
        alt: "Feuilles de thé transformées par l’oxydation",
      },
    },
  },
  {
    number: 4,
    title: "Fixation",
    cuvees: ["Brume des Cimes", "Écorce de Feu", "Miel d’Orchidée"],
    description:
      "Un passage bref à forte chaleur fige la feuille et met fin à son oxydation. Pour Brume des Cimes, il intervient peu après la cueillette, afin de garder au thé vert sa fraîcheur et sa couleur. Pour les oolongs, il vient plus tard, au moment choisi pour arrêter leur évolution. Les feuilles sont ensuite roulées, puis séchées.",
    images: {
      botanical: {
        src: "/figma/infuser/process/04-illu.webp",
        alt: "Feuille de thé après la fixation",
      },
      scene: {
        src: "/figma/infuser/process/04.webp",
        alt: "Feuilles de thé travaillées pendant la chauffe",
      },
    },
  },
  {
    number: 5,
    title: "Torréfaction",
    cuvees: ["Écorce de Feu"],
    description:
      "Dernière étape pour Écorce de Feu : une torréfaction lente, puis un long repos, le temps que le feu se fonde dans la feuille. Ce travail de patience lui donne sa structure et sa longueur en bouche.",
    images: {
      botanical: {
        src: "/figma/infuser/process/05-illu.webp",
        alt: "Feuilles de thé après la torréfaction",
      },
      scene: {
        src: "/figma/infuser/process/05.webp",
        alt: "Feuilles de thé torréfiées dans un panier",
      },
    },
  },
];
