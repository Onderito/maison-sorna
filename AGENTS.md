# Maison Sörna — Codex Instructions

## Project

Maison Sörna is a premium headless e-commerce experience built with Next.js and Shopify.

The frontend experience, design, interactions and animations are owned by Next.js.

Shopify is the commerce backend and source of truth for:

- products
- variants
- prices
- inventory / availability
- carts
- customer commerce data
- checkout
- orders

Production frontend is deployed on Vercel.

---

## Core Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Shopify Storefront API
- Shopify Customer Account API
- GraphQL
- Vercel

The project uses `/app` directly.

Do NOT introduce a `/src` directory unless explicitly requested.

---

## General Rules

Before modifying code:

1. Inspect the existing repository.
2. Understand the current implementation.
3. Reuse existing components and patterns when appropriate.
4. Do not refactor unrelated code.
5. Do not modify the visual design unless explicitly requested.
6. Do not remove or simplify animations unless explicitly requested.
7. Prefer the smallest clean change that solves the problem.

Do not over-engineer.

This is a bespoke premium storefront, not a generic reusable e-commerce framework.

---

## Frontend Ownership

Next.js owns the complete storefront experience.

This includes:

- pages
- layouts
- product presentation
- collection presentation
- navigation
- cart UI
- variant selectors
- interactions
- animations
- transitions
- responsive behavior

Shopify themes are NOT the primary frontend.

Do not introduce Shopify Liquid/theme development unless explicitly requested.

---

## Shopify Architecture

Keep Shopify logic separated from UI logic.

Preferred structure:

lib/
shopify/
client.ts
products.ts
cart.ts
customers.ts
types.ts

actions/
cart.ts

Adapt this structure if the existing repository provides a clearly better organization.

Do not put all Shopify queries and mutations into one large file.

---

## Shopify Client

Centralize Storefront API communication.

The Shopify client should:

- use GraphQL
- accept queries and variables
- be typed
- handle HTTP errors
- handle GraphQL errors
- support appropriate Next.js caching/revalidation
- remain server-side when using private credentials

Expected environment variables include:

SHOPIFY_STORE_DOMAIN
SHOPIFY_STOREFRONT_ACCESS_TOKEN

Never hardcode credentials.

Never expose private Shopify tokens through `NEXT_PUBLIC_*`.

Never send private Shopify credentials to Client Components.

---

## Shopify APIs

Use current Shopify APIs and recommended approaches.

Before introducing Shopify authentication or API patterns:

- verify that the approach is current
- avoid deprecated or legacy APIs
- prefer official Shopify recommendations

Storefront API:

- catalog
- products
- variants
- collections
- cart

Customer Account API:

- customer authentication
- profile
- addresses
- order history
- customer-specific commerce data

Do NOT implement legacy customer authentication patterns when the modern Customer Account API should be used.

---

## Products

Products must come from Shopify.

Product pages use dynamic handles:

/produits/[handle]

Mental model:

URL handle
→ Next.js
→ Storefront API
→ Shopify Product

Do not hardcode product-specific data when Shopify already provides it.

Product data may include:

- id
- handle
- title
- description
- images
- SEO
- variants
- prices
- availability
- selected options

Use `notFound()` when a Shopify product does not exist.

---

## Variants

A Product is what we present.

A ProductVariant is what the customer buys.

Never use Product ID as the cart merchandise ID.

Cart operations must use:

ProductVariant.id → merchandiseId

Variant selection must remain dynamic.

Do not hardcode variant IDs.

---

## Cart

Shopify is the source of truth for cart contents.

Use Shopify cart APIs for:

- cartCreate
- cartLinesAdd
- cartLinesUpdate
- cartLinesRemove
- cart retrieval

Persist only the Shopify `cartId` locally.

Preferred persistence:

- HttpOnly cookie
- sameSite: lax
- secure in production
- path: /

Do NOT store the complete cart in cookies.

Expected flow:

Add product
→ read cartId cookie
→ create Shopify cart if missing
→ persist cartId
→ add selected ProductVariant
→ retrieve cart state from Shopify

Handle invalid or expired carts gracefully.

An invalid cart ID must not permanently break the storefront.

---

## Checkout

Do NOT build a custom payment system.

Shopify owns checkout and payment.

Expected flow:

Custom Next.js cart
→ Shopify Cart
→ checkoutUrl
→ Shopify Checkout

Shopify handles:

- customer checkout information
- shipping
- taxes according to store configuration
- payment
- Shop Pay
- order creation

Never process or store payment card information in this application.

Do not create unnecessary payment infrastructure.

---

## Customer Accounts

Use Shopify Customer Account API.

Authentication should follow Shopify's current OAuth / OpenID Connect recommendations.

Conceptual flow:

Next.js
→ Shopify authorization
→ customer authentication
→ Next.js callback
→ token exchange
→ Customer Account API

Customer authentication tokens are customer-specific.

Do not confuse them with Storefront API credentials.

Production callback/origin/logout URLs must use the real HTTPS deployment.

Do not invent production URLs when they are unknown.

---

## Server vs Client

Prefer Server Components for:

- Shopify data fetching
- product retrieval
- collection retrieval
- server-only operations

Use Client Components when browser interaction is genuinely required, such as:

- variant selection
- cart drawer interaction
- quantity controls
- interactive animations

Keep Client Components as small as practical.

Do not move Shopify secrets or server-only logic into Client Components.

Use Server Actions or Route Handlers when appropriate.

---

## Next.js Caching

Use caching intentionally.

Do not blindly use:

cache: "no-store"

for every Shopify request.

Products and collections may use caching/revalidation where appropriate.

Structure Shopify fetching so tag-based revalidation can be introduced when useful.

Cart and customer-specific data must not be treated like public catalog data.

---

## TypeScript

Avoid `any`.

Create focused types for data actually consumed by the application.

Examples:

- ShopifyProduct
- ShopifyVariant
- ShopifyMoney
- ShopifyImage
- ShopifyCart
- ShopifyCartLine

Do not reproduce the entire Shopify GraphQL schema manually.

Prefer small, useful domain types.

---

## Error Handling

Handle failures explicitly.

Important cases include:

- Shopify API unavailable
- HTTP errors
- GraphQL errors
- Shopify `userErrors`
- missing product
- unavailable variant
- invalid cart
- expired cart
- malformed Shopify response

Do not silently swallow important errors.

User-facing failures should degrade gracefully.

---

## Security

Never:

- commit secrets
- expose private Storefront tokens
- hardcode tokens
- hardcode cart IDs
- hardcode ProductVariant IDs
- trust browser input blindly
- expose server-only environment variables
- process card information

`.env.local` must remain ignored by Git.

---

## Design & Animation Protection

Maison Sörna has a deliberate custom art direction.

Do NOT:

- redesign existing sections without being asked
- replace custom UI with generic e-commerce components
- simplify layouts for convenience
- remove animations because another implementation is easier
- introduce a component library without explicit approval

When implementing functionality, adapt the functionality to the existing design — not the design to the functionality.

Animations and visual interactions are part of the product experience.

Preserve them unless explicitly instructed otherwise.

---

## Code Quality

Prefer:

- simple functions
- clear naming
- small focused modules
- explicit data flow
- reusable logic where reuse actually exists
- readable GraphQL operations
- predictable error handling

Avoid:

- premature abstractions
- giant utility files
- unnecessary dependencies
- duplicated Shopify logic
- speculative architecture
- refactoring unrelated working code

---

## Working With Codex

For substantial tasks:

1. Inspect the relevant files first.
2. Explain briefly what already exists.
3. Identify the files that need modification.
4. State the intended approach.
5. Implement only the requested scope.
6. Run relevant checks when possible.
7. Report what changed and any remaining concerns.

If a request conflicts with this architecture, flag the conflict before making a major architectural change.

Do not make large unrelated changes simply to make the code match a preferred pattern.

---

## Guiding Principle

The architecture should remain:

Next.js / Vercel
↓
Custom Maison Sörna storefront
↓
Shopify APIs
↓
Shopify commerce backend
↓
Shopify Checkout

Next.js owns the experience.

Shopify owns commerce.

Keep that boundary clear.
