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
      "Bourgeons seuls ou feuilles plus mûres : chaque cru appelle sa cueillette. Au printemps, le choix de la pousse et du moment donne au thé son premier caractère.",
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
    cuvees: ["Pivoine Royale"],
    description:
      "Pour Pivoine Royale, les feuilles sont longuement étalées et perdent une part de leur humidité. Ce flétrissage est suivi d’un séchage : deux gestes qui préservent la délicatesse du thé blanc.",
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
      "Au contact de l’air, la feuille se transforme. Partielle pour les oolongs Écorce de Feu et Miel d’Orchidée, complète pour le thé noir Sourcil d’Or, l’oxydation façonne le caractère de chaque cru.",
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
    cuvees: ["Brume des Cimes"],
    description:
      "Pour Brume des Cimes, les feuilles sont chauffées peu après la cueillette afin d’empêcher leur oxydation et de préserver leur fraîcheur. Elles sont ensuite roulées et séchées.",
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
      "Après une oxydation partielle, Écorce de Feu est torréfié, puis laissé au repos pour que le feu se fonde dans la feuille. Ce travail de patience révèle sa structure et sa longueur en bouche.",
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
