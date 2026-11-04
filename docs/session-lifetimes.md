# Durée du panier et de la connexion

Réglage demandé le 4 novembre 2026 :

- Panier : 14 jours depuis sa création, avec uniquement son identifiant dans un cookie HttpOnly. La date Shopify est vérifiée à la lecture, ce qui applique aussi la limite aux anciens cookies réglés sur 30 jours. Un panier expiré est présenté comme vide et le prochain ajout crée un nouveau panier.
- Compte : 7 jours maximum depuis la connexion initiale, sans prolongation lors des renouvellements de jetons, y compris au checkout.
- Déconnexion : efface les cookies d’authentification, conserve le panier.
- Paiement : un compte expiré ne bloque pas le parcours invité. Le panier n’est pas effacé lors du simple départ au checkout, car l’achat peut être abandonné. Un panier que Shopify ne renvoie plus est traité comme expiré ou terminé.

La limite de connexion vient de la date `iat` du jeton d’identité original signé par Shopify. La signature, l’émetteur et l’audience sont vérifiés ; ce reçu sert uniquement à dater la connexion. Il n’autorise aucune requête à lui seul : les requêtes Customer Account API utilisent toujours le jeton d’accès actuel, validé par Shopify. La validation OAuth initiale continue à vérifier la date d’expiration et le nonce. Aucun secret supplémentaire n’est nécessaire.

Les cookies d’accès sont limités à la plus courte durée entre `expires_in` de Shopify et le temps restant de la session. Le cookie du jeton d’identité original n’est pas remplacé au renouvellement. Les lectures du profil et des données du compte vérifient aussi la limite côté serveur. Le navigateur revérifie la session à l’échéance et au retour sur l’onglet.

Les durées sont centralisées dans `app/lib/shopify/session-lifetime.ts`.

Références : [Shopify Customer Account API](https://shopify.dev/docs/api/customer/latest), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html).
