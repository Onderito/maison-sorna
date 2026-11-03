# Référencement et lancement

## À reprendre avec l’utilisateur au lancement

Demande du 3 novembre 2026 : accompagner l’utilisateur pour connecter son domaine définitif, renseigner `NEXT_SITE_URL`, activer `SEO_INDEXABLE=true` uniquement en Production, puis redéployer et vérifier l’indexation. Le domaine définitif reste à préciser ; garder le site en `noindex` jusque-là. Terminer par la configuration de Google Search Console et la soumission du sitemap.

## Variables Vercel

- `NEXT_SITE_URL` : origine HTTPS publique complète, sans chemin (par exemple l’URL Vercel actuelle, puis le domaine définitif). Cette variable est aussi utilisée par l’authentification Shopify : garder ses URL de callback/origine/déconnexion cohérentes lors du changement de domaine.
- `SEO_INDEXABLE` : `false` pendant la préparation. Passer à `true` uniquement dans l’environnement Production au lancement, puis redéployer. Les environnements Vercel Preview et Development restent en `noindex`, même si cette variable vaut `true`.

Sans configuration, l’indexation reste désactivée. Aucun domaine commercial n’est présumé. En local, la base par défaut est `http://localhost:3000`.

## Comportement

- `/robots.txt` autorise les pages publiques et exclut `/api/`. Le blocage des API ne protège aucune donnée privée.
- Les pages portent un `noindex` tant que le lancement n’est pas activé. L’exploration reste autorisée pour permettre de lire cette directive.
- `/sitemap.xml` est vide avant lancement. Après activation, il inclut `/`, `/infuser`, `/appliquer`, `/ressentir`, `/recevoir` et les produits publiés sur le canal Storefront Shopify utilisé par l’application, avec pagination. Les dates des produits viennent de Shopify, sans date artificielle pour les pages éditoriales.
- Le catalogue du sitemap est revalidé toutes les heures. Une erreur Shopify produit une erreur explicite, pas un faux sitemap réussi et incomplet.
- Le panier et les comptes restent en `noindex` après lancement. Ils sont absents du sitemap.
- Les fiches utilisent les champs SEO Shopify, avec repli sur le titre et la description. Prix et disponibilité des données structurées proviennent des variantes Shopify. Aucun avis ni engagement de livraison n’est inventé.

## Vérifications après déploiement

1. Vérifier les réponses HTTP 200 de `/robots.txt` et `/sitemap.xml` sur le vrai domaine.
2. Avant lancement, vérifier `noindex` dans le HTML d’une page publique. Vérifier également une preview Vercel.
3. Après activation, vérifier l’absence de `noindex` sur l’accueil et une fiche produit ; vérifier sa présence sur `/panier` et `/compte`.
4. Vérifier que canonical, Open Graph et sitemap utilisent tous `NEXT_SITE_URL`, et que les URL du sitemap répondent réellement.
5. Choisir un domaine principal (avec ou sans www), rediriger les autres domaines de production vers celui-ci dans Vercel. Ne pas rediriger les previews destinées aux tests.
6. Tester une fiche dans Google Rich Results Test. Vérifier les champs SEO et les images dans Shopify.
7. Ajouter le domaine définitif à Google Search Console, vérifier sa propriété par DNS et soumettre `/sitemap.xml`. Utiliser l’inspection d’URL pour l’accueil et une fiche produit. L’envoi du sitemap ne garantit pas l’indexation.

Ces opérations de compte et DNS nécessitent le domaine définitif et l’accès aux comptes concernés ; elles ne sont pas exécutées automatiquement par le code.
