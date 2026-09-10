export default function CartLoading() {
  return (
    <main className="mx-auto w-[calc(100%-2rem)] max-w-[1569px] border-t border-current/20 py-14 md:w-[90.8%] md:py-24">
      <p className="text-xs tracking-[0.18em] uppercase">Maison Sörna</p>
      <h1 className="mt-10 font-display text-[clamp(4rem,10vw,10rem)] leading-[0.8] tracking-[-0.05em]">Votre panier</h1>
      <p className="mt-14 border-t border-current/20 pt-8 text-xs tracking-[0.14em] uppercase opacity-60" role="status">Chargement du panier…</p>
    </main>
  );
}
