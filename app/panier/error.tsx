"use client";

export default function CartError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12">
      <h1 className="text-3xl">Panier indisponible</h1>
      <p>Nous n’avons pas pu charger votre panier. Réessayez dans un instant.</p>
      <button
        type="button"
        onClick={reset}
        className="min-h-12 cursor-pointer rounded-lg bg-foreground px-6 py-3 text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        Réessayer
      </button>
    </main>
  );
}
