"use client";

export default function AccountError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-[calc(100%-2rem)] max-w-[1569px] border-t border-current/20 py-14 md:w-[90.8%] md:py-24">
      <p className="text-xs tracking-[0.18em] uppercase">Espace personnel</p>
      <h1 className="mt-12 max-w-4xl font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.82] tracking-[-0.045em]">Compte indisponible</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-12 min-h-12 border-b border-current text-sm tracking-[0.12em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none"
      >
        Réessayer
      </button>
    </main>
  );
}
