# Photos des chapitres de l’histoire

Chaque chapitre possède trois fichiers indépendants à remplacer en conservant leur nom :

| Chapitre | Portrait gauche | Portrait droit | Panoramique bas |
| --- | --- | --- | --- |
| Sancerre | `sancerre-photo-gauche.png` | `sancerre-photo-droite.png` | `sancerre-photo-panoramique.png` |
| L’Île | `ile-photo-gauche.png` | `ile-photo-droite.png` | `ile-photo-panoramique.png` |
| Orna | `orna-photo-gauche.png` | `orna-photo-droite.png` | `orna-photo-panoramique.png` |

Les portraits sont affichés en 4:5 et le panoramique en 1096:394 sur ordinateur.
Les photos de Sancerre et de L’Île proviennent de la maquette Figma 2281:214.
Les photos d’Orna sont provisoirement des copies de Sancerre, en attendant leur remplacement.

Le fond réutilise `/figma/infuser/process/background.png`, comme la section Infuser.
`fond-matiere.png` et `fond-papier.png` sont les anciens exports Figma, conservés mais non utilisés.
Les textes sont centralisés dans `app/ressentir/_components/origin-chapters.tsx`.
Les textes de L’Île restent ceux de la maquette en attendant les textes définitifs ; ceux d’Orna ont été fournis et intégrés.
