export type ProcessImage = {
  src: string;
  alt: string;
};

export type ProcessStep = {
  number: number;
  title: string;
  description: string | null;
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
    description:
      "Les jeunes feuilles sont prélevées à maturité, au moment où leur expression aromatique est la plus juste. Une récolte précise, à l’origine du caractère de chaque cru.",
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
    description:
      "Délicatement étalées, les feuilles reposent jusqu’à perdre une part de leur humidité. Elles s’assouplissent lentement et concentrent leurs arômes, prêtes à révéler toute leur complexité.",
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
    description:
      "Au contact de l’air, la feuille se transforme et sa couleur s’approfondit. Cette évolution maîtrisée façonne la richesse aromatique du cru, entre notes végétales, florales et fruitées.",
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
    title: "Chauffe / fixation",
    description:
      "Une chauffe précise interrompt l’oxydation au moment juste. Le profil aromatique se fixe, les nuances de la feuille sont préservées et l’identité du cru prend sa forme définitive.",
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
    description:
      "Lentement torréfiées, les feuilles gagnent en profondeur et développent leurs notes chaudes. Ce dernier geste affine leur équilibre, stabilise leurs arômes et signe la longueur du cru.",
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
