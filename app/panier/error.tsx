"use client";

export default function CartError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-[calc(100%-2rem)] max-w-[1569px] border-t border-current/20 py-14 md:w-[90.8%] md:py-24">
      <p className="text-xs tracking-[0.18em] uppercase">Maison Sörna</p>
      <h1 className="mt-10 max-w-5xl text-balance font-display text-[clamp(4rem,10vw,10rem)] leading-[0.8] tracking-[-0.05em]">Panier indisponible</h1>
      <p className="mt-10 max-w-md text-base leading-7 opacity-80">Nous n’avons pas pu charger votre panier. Réessayez dans un instant.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 min-h-12 cursor-pointer border-b border-current text-sm tracking-[0.12em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none"
      >
        Réessayer
      </button>
    </main>
  );
}
