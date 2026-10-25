# Animations GSAP

Ce dossier contient la configuration GSAP et les hooks d’animation de Maison Sörna.

## Organisation

- `gsap.ts` : point d’entrée client, enregistrement de `useGSAP`. Importer `gsap` et `useGSAP` depuis `@/animations/gsap`.
- Un fichier `use-<nom-de-la-sequence>.ts` par séquence, ajouté lorsque cette animation est implémentée. Le hook contient les refs, les timelines et leur cycle de vie.
- Le composant conserve le JSX, les classes et la logique métier. Il attache les refs retournées par le hook aux éléments concernés.
- Garder les pages et les contenus statiques en Server Components. Placer les hooks dans de petits Client Components ou des wrappers clients recevant le contenu serveur via `children`.

## Séquences implémentées

- `use-product-dialog.ts` : fiche cuvée plein écran, partagée 50/50 sur ordinateur, avec le fond crème texturé commun au site. Une copie de l’image cliquée rejoint sa position à droite via `x`, `y`, `scale` uniforme (300ms), puis les groupes de la fiche apparaissent à gauche (250ms, stagger 25ms). Bézier `0.2, -0.03, 0.52, 0.99`. La fermeture repart des transforms courants et rejoint la position actuelle de la miniature en 300ms. La miniature est réaffichée avant `dialog.close()` dans la même frame pour éviter un trou au raccord. L’illustration de la fiche utilise un cadrage paysage de hauteur contenue. La colonne gauche défile seule ; image, fermeture et achat restent fixes à droite. Sur mobile, image en haut et détails défilants en dessous. Dialogue natif, Échap, focus contenu puis restitué, mouvement réduit et cleanup local. Lenis et le scroll racine sont bloqués puis restaurés sans déplacer la collection. Les contenus sont préparés avant l’ouverture pour mesurer les deux positions sans montage au milieu de la transition. Les données restent fournies côté serveur.
- `use-site-navigation.ts` : disparition au scroll descendant et retour au scroll montant, avec le Bézier `0.2, -0.03, 0.52, 0.99` via CustomEase et des transitions de 300ms. Le fond beige accompagne le retour par opacité et translation. Les tweens repartent des valeurs courantes ; le focus clavier et le mouvement réduit révèlent la barre immédiatement. Les listeners et les tweens sont nettoyés, y compris lorsque le portail d’hydratation ou la route change.
- `use-faq-entrance.ts` : timeline unique déclenchée à l’entrée de la section. Le titre et le sous-titre apparaissent d’abord (`power2.out`), puis l’image se dévoile de gauche à droite par `clip-path` sur 850ms (`power2.inOut`). Le label `responses` lance ensuite les questions et le contact (`power2.out`). Le focus clavier révèle immédiatement la section ; le mouvement réduit conserve le rendu statique. `use-faq-item.ts` pilote l’accordéon, les icônes +/− et les retours de survol/focus ; les ouvertures de 200ms repartent des valeurs courantes en cas d’interruption. Un ResizeObserver mesure uniquement les changements du contenu, et se déconnecte au démontage. La hauteur reste animée ici pour déplacer les questions voisines ; les autres propriétés sont des transforms et de l’opacité.
- `use-process-transitions.ts` : empilement des cinq étapes du thé avec des pins ScrollTrigger, `pinSpacing: false` et opacité des voiles noirs pilotée directement par GSAP (`scrub: 0.2`). Le déplacement suit le scroll Lenis existant (`lerp: 0.1`), sans nouvelle boucle de lissage. Les panneaux gardent leur place dans le flux et leur ordre de superposition. Le mouvement réduit et les fenêtres de 650px de haut ou moins utilisent une lecture statique, sans pin.
- `use-scroll-image-introduction.ts` : introduction « Le geste », pin du viewport et agrandissement de l’image au scroll. Une seule timeline lissée au scroll (`scrub: 0.4`) ouvre l’image puis révèle le titre entier dans un masque, avec `power2.out` ; le paragraphe suit. Le titre ne fait l’objet d’aucun découpage en lettres ou en mots. La section de `190svh` réserve la distance de scroll ; le pin n’ajoute donc pas de padding (`pinSpacing: false`). `scroll-trigger.ts` enregistre le plugin utilisé par cette séquence. Le CSS conserve uniquement la mise en page, les masques statiques et le rendu accessible sans animation.

## Cycle de vie et ciblage

- Utiliser `useRef` pour le conteneur et les cibles DOM. Passer `ref.current` aux méthodes GSAP ; passer la ref du conteneur à `scope` dans `useGSAP`.
- Créer les animations dans le callback de `useGSAP`, jamais pendant le rendu. Les sélecteurs doivent rester limités au conteneur ; éviter les sélecteurs globaux.
- `useGSAP` restaure les styles et nettoie les animations et ScrollTriggers enregistrés dans son contexte au démontage, y compris lors des cycles de vérification de React Strict Mode.
- Si une animation dépend de valeurs React, déclarer `dependencies` et utiliser `revertOnUpdate: true` lorsque la séquence doit être nettoyée puis reconstruite à leur changement.
- Envelopper dans `contextSafe` les handlers différés ou événementiels qui créent des animations après l’exécution du callback principal. Cela les rattache au contexte ; cela ne désabonne pas les événements et n’annule pas les callbacks différés.
- Retourner un cleanup pour les ressources créées manuellement : `removeEventListener`, `clearTimeout`, annulation des `requestAnimationFrame`, déconnexion des observers. Nettoyer les instances `gsap.matchMedia()` avec `revert()`.
- Ne pas utiliser de nettoyage global tel que `ScrollTrigger.killAll()` ou `gsap.globalTimeline.clear()` depuis un composant.

## Mouvement et performance

- Respecter `prefers-reduced-motion`, y compris si la préférence change pendant la session. Utiliser `gsap.matchMedia()` dans `useGSAP` lorsque des variantes sont nécessaires.
- Privilégier `x`, `y`, `scale`, `rotation` et `opacity`. Préserver les tokens d’easing existants, les interactions interruptibles et les transitions UI courtes définies dans `AGENTS.md`.
- Regrouper les lectures DOM avant les écritures. Éviter les mises à jour React à chaque frame.
- Utiliser `will-change` et `force3D` uniquement pour un besoin identifié ; ne pas les appliquer systématiquement.
- Enregistrer les plugins supplémentaires uniquement lorsqu’une animation les utilise. Ne pas installer de ticker GSAP global pour Lenis sans besoin démontré.
- Vérifier les montages/démontages, les navigations, les instances multiples et le mouvement réduit. Mesurer la fluidité sur appareil avant d’affirmer un gain de performance.

## Références fournies

Les documents originaux sont conservés dans `docs/`. Consulter les références pertinentes avant d’écrire ou de revoir une animation GSAP :

- [React et Next.js](../docs/gsap-react.md) : `useGSAP`, refs, scope, dépendances, contexte et cleanup.
- [ScrollTrigger](../docs/gsap-scrolltrigger.md) : déclenchement au scroll, scrub, pinning, timelines et refresh.
- [Performance](../docs/gsap-performance.md) : transforms, lectures/écritures DOM et limitation du travail simultané.

Adapter les exemples au contexte du projet : notamment, le cleanup d’un composant doit rester limité à ses propres animations et triggers.

Documentation officielle : [GSAP avec React](https://gsap.com/resources/React/) et [useGSAP](https://github.com/greensock/react).
