# Animations GSAP

Ce dossier contient la configuration GSAP et les hooks d’animation de Maison Sörna.

## Organisation

- `gsap.ts` : point d’entrée client, enregistrement de `useGSAP`. Importer `gsap` et `useGSAP` depuis `@/animations/gsap`.
- Un fichier `use-<nom-de-la-sequence>.ts` par séquence, ajouté lorsque cette animation est implémentée. Le hook contient les refs, les timelines et leur cycle de vie.
- Le composant conserve le JSX, les classes et la logique métier. Il attache les refs retournées par le hook aux éléments concernés.
- Garder les pages et les contenus statiques en Server Components. Placer les hooks dans de petits Client Components ou des wrappers clients recevant le contenu serveur via `children`.

## Séquences implémentées

- `use-tea-collection-entrance.ts` : entrée unique de « À chacun son sommet ». Label, titre entier sous masque (650ms), puis sous-titre ; les cartes apparaissent par rangée en opacité et `y: 18 → 0`, 650ms par carte avec stagger de 65ms, `power2.out`. Chaque rangée attend son entrée dans l’écran et la fin de l’en-tête avec un léger chevauchement. Une arrivée directe par « Les cinq crus » (`/infuser#les-cuvees`), une restauration du scroll ou un refresh déclenchent aussi les rangées dont le seuil est déjà atteint ; un garde empêche de relancer leur apparition. La grille existante est mesurée avant les écritures et regroupée selon ses rangées réelles aux trois breakpoints. Les cartes déjà vues restent visibles après resize. Focus clavier ou activation d’un produit : fin immédiate du reveal pour garder un accès direct et une origine stable au dialogue cuvée. Mouvement réduit et absence de JavaScript : rendu statique. Données Shopify et contenu conservés côté serveur ; refs, timelines et triggers nettoyés localement.

- `use-story-text-reveal.ts` : les quatre introductions marron texturées de Ressentir révèlent d’abord le grand titre par mot (`yPercent: 125 → 0`, 800 ms par mot, stagger 80 ms, `CustomEase` `0.431, 0.012, 0.519, 1.122`). Le paragraphe commence strictement après la fin du dernier mot du titre : même reveal éditorial partagé que les Origines, Le thé et Le soin, avec vrais masques de lignes SplitText et translation des mots. Aucun fondu global du paragraphe ni chevauchement avec le titre. Timeline parent retournée par `onSplit` pour nettoyer et recalculer ensemble les deux parties. Déclenchement unique lorsque le haut de la section atteint 35 % de l’écran, sans scrub ni retour en arrière. Fond fixe, aucun pin. Sans JavaScript et en mouvement réduit : contenu statique. Les parties déjà commencées restent visibles lors d’un recalcul ; cleanup local via `useGSAP`, `matchMedia` et `SplitText.revert()`.

- `use-page-transition.ts` : volet crème texturé persistant dans le layout entre l’accueil, Infuser, Appliquer et Ressentir. Translation verticale seule, couverture en 250ms puis sortie vers le haut en 280ms avec le Bézier `0.2, -0.03, 0.52, 0.99`. `TransitionLink` conserve Next Link et sa navigation native pour les ancres de la page, les autres routes et les clics modifiés. La découverte attend le montage de la route et le décodage des images de hero (attente bornée). Les clics pendant la couverture actualisent la destination ; les séquences ne se superposent pas. Mouvement réduit : navigation directe. Scroll/Lenis restaurés, annulation sur historique et cleanup des tweens, listeners et timers.

- `use-product-dialog.ts` : fiche cuvée plein écran, partagée 50/50 sur ordinateur, avec le fond crème texturé commun au site. Une copie de l’image cliquée rejoint sa position à droite via `x`, `y`, `scale` uniforme (300ms), puis la colonne et les groupes de la fiche apparaissent à gauche à partir de 420ms sur ordinateur (250ms par groupe, stagger 25ms). Le rythme mobile est conservé. Bézier `0.2, -0.03, 0.52, 0.99`. La fermeture repart des transforms courants et rejoint la position actuelle de la miniature en 300ms. La miniature est réaffichée avant `dialog.close()` dans la même frame pour éviter un trou au raccord. L’illustration de la fiche utilise un cadrage paysage de hauteur contenue. La colonne gauche défile seule ; image, fermeture et achat restent fixes à droite. Sur mobile, image en haut et détails défilants en dessous. Dialogue natif, Échap, focus contenu puis restitué sans contour au retour automatique ; les repères de focus reprennent à la navigation clavier suivante, mouvement réduit et cleanup local. Lenis et le scroll racine sont bloqués puis restaurés sans déplacer la collection. Les contenus sont préparés avant l’ouverture pour mesurer les deux positions sans montage au milieu de la transition. Les données restent fournies côté serveur.
- `use-site-navigation.ts` : disparition au scroll descendant et retour au scroll montant, avec le Bézier `0.2, -0.03, 0.52, 0.99` via CustomEase et des transitions de 300ms. Le fond beige accompagne le retour par opacité et translation. Les tweens repartent des valeurs courantes ; le focus clavier et le mouvement réduit révèlent la barre immédiatement. Les listeners et les tweens sont nettoyés, y compris lorsque le portail d’hydratation ou la route change.
- `use-faq-entrance.ts` : une seule timeline GSAP desktop/mobile, avec départs ordonnés et chevauchements : titre à 0 ms puis description à 180 ms avec le reveal éditorial partagé (SplitText, masques des lignes réelles, `yPercent: 115 → 0`, 800 ms par mot, ondulation et rythme par phrase), image à 380 ms (300 ms), questions/réponses à 580 ms (250 ms par rangée, stagger 55 ms), contact à 950 ms (200 ms). Les départs utilisent des labels explicites ; aucun bloc n’attend la fin complète du précédent. Le reveal texte conserve son rythme partagé sans cumuler les durées des passages. La composition est révélée en environ 1,15 s au desktop courant ; des lignes de texte supplémentaires sur petit écran peuvent finir légèrement après. Texte animé en transform seul derrière des masques `overflow: clip` ; image et questions en `autoAlpha` et `y: 8 → 0`, `power2.out`. Aucun `clip-path` ni dimension animée. CSS serveur avec fallback noscript pour éviter le flash avant hydratation ; GSAP pose les états initiaux une seule fois, puis utilise uniquement des `.to()`. Le découpage titre/description est restauré à la fin. Si les lignes changent pendant la lecture, la séquence est terminée sans redémarrage. ScrollTrigger séparé de la timeline, déclenchement unique à 75 % du viewport et rattrapage des arrivées par ancre. Aucun breakpoint ne reconstruit la séquence, aucun refresh ne la rembobine, aucun clic pointeur ne la saute. Le focus clavier termine la séquence immédiatement ; mouvement réduit statique. Questions pilotées uniquement par l’état React : la réponse prend sa place immédiatement, sans hauteur animée, mesure DOM, ResizeObserver ni refresh ScrollTrigger au clic. Seul le texte d’ouverture utilise une transition CSS `transform`/`opacity` de 160 ms via `@starting-style` ; fermeture immédiate. Icône et survol/focus en CSS (160/120 ms), survol limité aux pointeurs fins. Activation clavier : texte et icône instantanés. Mouvement réduit : opacité seule, 120 ms. Une seule réponse ouverte, régions fermées masquées et inertes. Source photo WebP de 349 306 octets à dimensions conservées, chargement lazy avec Next Image.
- `use-process-transitions.ts` : empilement des cinq étapes du thé avec des pins ScrollTrigger, `pinSpacing: false` et opacité des voiles noirs pilotée directement par GSAP (`scrub: 0.2`). Le déplacement suit le scroll Lenis existant (`lerp: 0.1`), synchronisé avec ScrollTrigger une seule fois dans `SmoothScroll`, sans nouvelle boucle de lissage. Les panneaux gardent leur place dans le flux et leur ordre de superposition. Le mouvement réduit et les fenêtres de 650px de haut ou moins utilisent une lecture statique, sans pin.
- `use-scroll-image-introduction.ts` : « Le geste » ouvre la photographie pendant que le titre entier apparaît dans un masque (`power2.out`), puis le paragraphe. Une pause de lecture précède le relais : la photo reste épinglée jusqu’à l’arrivée de Récolte en haut de l’écran, pendant que son panneau opaque la recouvre et que les textes s’effacent. Une seule timeline et `scrub: 0.4`, sans inertie supplémentaire ni distance de document ajoutée (section 190svh, `pinSpacing: false`). Sur desktop, la photo intérieure dérive subtilement (`scale: 1.06 → 1.03`, `yPercent: 1 → -1`), séparément du cadre et du grain ; sur mobile, le cadre s’ouvre par `scale: 0.76 → 1`, sans dérive intérieure. Lecture statique sans pin pour le mouvement réduit, les écrans de 650px de haut ou moins, ou un texte trop haut. Cleanup local ; aucune variante de comparaison conservée.

## Cycle de vie et ciblage

- Utiliser `useRef` pour le conteneur et les cibles DOM. Passer `ref.current` aux méthodes GSAP ; passer la ref du conteneur à `scope` dans `useGSAP`.
- Créer les animations dans le callback de `useGSAP`, jamais pendant le rendu. Les sélecteurs doivent rester limités au conteneur ; éviter les sélecteurs globaux.
- `useGSAP` restaure les styles et nettoie les animations et ScrollTriggers enregistrés dans son contexte au démontage, y compris lors des cycles de vérification de React Strict Mode.
- Si une animation dépend de valeurs React, déclarer `dependencies` et utiliser `revertOnUpdate: true` lorsque la séquence doit être nettoyée puis reconstruite à leur changement.
- Envelopper dans `contextSafe` les handlers différés ou événementiels qui créent des animations après l’exécution du callback principal. Cela les rattache au contexte ; cela ne désabonne pas les événements et n’annule pas les callbacks différés.
- Retourner un cleanup pour les ressources créées manuellement : `removeEventListener`, `clearTimeout`, annulation des `requestAnimationFrame`, déconnexion des observers. Nettoyer les instances `gsap.matchMedia()` avec `revert()`.
- Ne pas utiliser de nettoyage global tel que `ScrollTrigger.killAll()` ou `gsap.globalTimeline.clear()` depuis un composant.

## Mouvement et performance

### Propriétés GSAP — règle permanente

| Propriété GSAP | Performance potentielle | Utilisation |
| --- | --- | --- |
| `x`, `y` | Excellente | Translation, reveal, parallaxe |
| `xPercent`, `yPercent` | Excellente | Transitions relatives à la taille |
| `scale`, `scaleX`, `scaleY` | Excellente | Zoom, ouverture, expansion |
| `rotation` | Excellente | Rotation |
| `autoAlpha` | Excellente | Apparition, disparition (`opacity` et bascule de `visibility`) |
| `clipPath` | Variable — interdit dans ce projet | Ne plus utiliser pour les masques ou révélations |
| `width`, `height` | À surveiller | Dimensions, seulement lorsque le flux doit réellement évoluer |
| `top`, `left` | À éviter si possible | Préférer `x` et `y` pour les déplacements |

**Direction permanente : aucun `clip-path` CSS ni `clipPath` GSAP dans les animations.** Pour toutes les révélations d’images, animer uniquement `transform` (via `x`, `y`, `xPercent`, `yPercent`, `scale`) et `opacity`/`autoAlpha` ; ne jamais animer `width`, `height`, `top` ou `left`. Les dimensions et positions CSS statiques restent autorisées pour la mise en page. Utiliser les transforms pour les ouvertures et un conteneur à débordement coupé pour les textes masqués. Ne pas réintroduire cette technique lors d’une nouvelle séquence.

Ces appréciations indiquent un potentiel : GSAP pilote ses tweens sur le thread principal ; les transforms ne garantissent pas à eux seuls une animation sans saccades. Vérifier sur mobile et Safari.

### Vérification du 28 octobre 2026

- Remplacement des révélations photographiques : opacité pour la FAQ ; opacité et `y: 18 → 0` pour Origines (Sancerre, L’Île, ORNA), Regard, La preuve et profils. Déclenchements, durées, ordre, cleanup et mouvement réduit conservés.
- « Le geste » mobile : ouverture par scale uniforme, sans interpolation de masque en pixels/pourcentages. Le desktop conserve sa séquence.
- Étapes du thé : découpe statique par `overflow: clip`, avec réserve supérieure de 64px pour les ombres ; aucun ancêtre à défilement ajouté autour des panneaux épinglés.
- Aucun `transition: all`, flou animé ou mise à jour React par frame identifié dans les hooks et styles examinés. Lenis conserve une seule boucle RAF synchronisée avec ScrollTrigger.
- FAQ simplifiée : aucune hauteur animée ni mesure/refresh au clic. Le flux change une fois ; seuls les transforms et l’opacité du texte et de l’icône animent. Les dimensions et positions de la copie volante du dialogue produit sont fixées avant animation ; le trajet utilise des transforms.
- Vérification visuelle sur appareil nécessaire pour confirmer la fluidité et le rendu des nouvelles apparitions ; l’inspection du code ne mesure pas les frames.


### Origines — révélations éditoriales

`use-origin-chapter-reveal.ts`, monté par `OriginChapterReveal` pour Sancerre, L’Île et ORNA, conserve le scroll naturel et la hauteur de chaque composition. Les révélations se jouent une seule fois, sans scrub ni retour arrière : titres masqués lettre par lettre (1 s par lettre, stagger 55 ms, départ après 120 ms), introductions et descriptions révélées dans les masques de leurs vraies lignes avec SplitText (`yPercent: 115 → 0` sur les mots, 800 ms, décalage de 80 ms entre lignes et aux fins de phrases, ondulation de 12 ms entre mots plafonnée à 80 ms, `power2.out`, déclenchement à 82 % du viewport). Chaque photo apparaît par opacité et `y: 18 → 0` en 1,4 s (déclenchement à 82 %), puis reste fixe, sans zoom ni parallaxe. Les départs proches sont espacés de 650 ms après un titre et de 320 ms entre les autres blocs, avec chevauchement. L’attente est plafonnée à 650 ms et les blocs déjà dépassés sont révélés immédiatement pour éviter une file d’attente lors d’un scroll rapide. Les blocs déjà commencés restent visibles après un changement de breakpoint. Aucun pin ni distance de scroll ajoutée. Le mouvement réduit conserve le contenu statique ; `matchMedia` et `useGSAP` nettoient les animations et leurs triggers.

### Le thé et Le soin

`use-regard-section-reveal.ts`, monté par `RegardSectionReveal`, anime chaque composition de 100svh avec `power2.out` : titre entier sous masque (900 ms à 0), introduction sous masques de lignes (départ à 300 ms), image en opacité et `y: 18 → 0` (1,3 s à 650 ms), puis notes et leurs intertitres sous masques de lignes (départs à 1,3 s et 1,46 s). Déclenchement unique au passage du haut de la section à 65 % du viewport. Sur mobile, la mise en page conserve sa hauteur naturelle : séquence du titre et de l’introduction à 80 %, puis image et notes à leur propre entrée à 82 %. Aucun scrub, pin, zoom ni parallaxe. Les éléments commencés restent visibles au changement de breakpoint ; mouvement réduit et absence de JavaScript donnent un rendu statique. Nettoyage local via `useGSAP` et `matchMedia`.

### La preuve

`use-authenticity-reveal.ts` conserve les quatre engagements et le carrousel mobile. Timeline desktop unique en `power2.out` : titre sous masque (900 ms), introduction à 300 ms, textes des cartes à 650 ms avec un décalage de 120 ms, puis images en opacité et `y: 18 → 0` à 950 ms (1,3 s, même décalage). Durée totale 2,61 s, déclenchement à 65 % du viewport. Sur mobile : titre et introduction à 80 %, puis textes et images du carrousel ensemble à son entrée à 82 %, sans décalage pour les cartes hors champ. Swipe, focus clavier ou sélection d’un engagement terminent immédiatement l’entrée. Lecture unique, aucun scrub ni parallaxe, éléments commencés préservés au changement de breakpoint, mouvement réduit statique et cleanup local via `useGSAP`/`matchMedia`.

### Fondateurs et personnes qui accompagnent la Maison

`use-profile-reveal.ts`, monté sur chaque article par `ProfileReveal`, conserve les profils côté serveur et leur composition alternée. Portrait révélé par opacité et `y: 18 → 0` en 1,3 s à 78 % du viewport ; nom sous masque en 900 ms, départ après 350 ms sur desktop. Pour les biographies qui tiennent dans la zone de lecture, les paragraphes suivent à 700 ms puis par pas de 200 ms (800 ms chacun), et le rôle termine la séquence (600 ms). Sur mobile et pour les longues biographies, chaque paragraphe attend sa propre entrée à 82 % ; les départs mobiles sont espacés de 120 ms. La photo éditoriale, présente à partir de 1024 px, attend son propre passage à 78 %. `power2.out`, lecture unique, aucun scrub, zoom ou parallaxe. Éléments déjà commencés préservés au changement de breakpoint, mouvement réduit statique, cleanup local via `useGSAP` et `matchMedia`.

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

## Direction artistique — paragraphes des Origines

Pour Sancerre, L’Île et ORNA, conserver des paragraphes continus sans retour à la ligne imposé entre les phrases. SplitText mesure les lignes réelles (`type: "lines,words"`, `mask: "lines"`, `autoSplit: true`, `deepSlice: true`). Chaque ligne a un masque statique `overflow: clip` ; les mots remontent de `yPercent: 115` à `0` en 800 ms avec `power2.out`. Départs espacés de 80 ms par ligne, légère ondulation de 12 ms par mot plafonnée à 80 ms, respiration supplémentaire de 80 ms après chaque fin de phrase. Aucun fondu du bloc, aucune dimension ni position de mise en page animée, aucun `clip-path`.

Créer la timeline dans `onSplit` et la retourner pour que le recalcul automatique nettoie les anciennes cibles et leurs triggers. Revenir au DOM original après la lecture, et au démontage. Les textes déjà commencés ne sont pas masqués à nouveau lors d’un resize. Les lignes hors écran restent en attente, y compris après refresh ; les arrivées par ancre rattrapent les blocs déjà atteints. Les emphases et le texte continu sont conservés, avec `aria: "none"` pour laisser leur sémantique au DOM sans dupliquer le contenu. Mouvement réduit et absence de JavaScript : paragraphes statiques.

Vérification dans Chrome : masques présents avant l’entrée, retrait du découpage après apparition, contenu complet et emphases conservés, recalcul en viewport de 390 px sans débordement horizontal, aucune erreur de console sur le parcours des Origines.

Les recettes des skills (`.agents/skills/animate/RECIPES.md`) sont des exemples génériques : elles ne remplacent pas ces règles. Ne pas reprendre leurs exemples de `clip-path` dans Maison Sörna, y compris pour un remplissage de bouton ou un reveal de texte.

### Reveal partagé — Le thé et Le soin

Les introductions, intertitres et paragraphes des deux notes utilisent désormais le même reveal SplitText que les Origines. Le rythme est partagé dans `create-editorial-text-reveal.ts` : masques de lignes réelles, `yPercent: 115 → 0`, 800 ms par mot, décalage de ligne et respiration entre phrases de 80 ms, ondulation de 12 ms par mot plafonnée à 80 ms, `power2.out`. Les déclenchements desktop/mobile, titres principaux et images sont conservés. Chaque timeline retournée par `onSplit` possède son ScrollTrigger pour nettoyer ensemble les anciennes cibles et le trigger lors du recalcul. DOM d’origine restauré à la fin, paragraphes continus avec emphases conservées, mouvement réduit statique.
