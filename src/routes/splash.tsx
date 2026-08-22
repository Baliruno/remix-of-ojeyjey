import { createFileRoute, Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "Welcome to Kampala City Live — Buildings, Shops & Goods" },
      {
        name: "description",
        content:
          "Start here: enter Kampala City Live to browse buildings, shops and goods, or sign in to manage your shop.",
      },
      { property: "og:title", content: "Welcome to Kampala City Live" },
      {
        property: "og:description",
        content: "Enter the live Kampala marketplace of buildings, shops and goods.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-accent/10 blur-2xl" />

      <main className="relative w-full max-w-sm text-center">
        <img
          src={logoAsset.url}
          alt="Kampala City Live logo"
          className="mx-auto size-40 animate-in object-contain duration-700"
        />
        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[10px] font-bold tracking-widest text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-signal-green" />
          KAMPALA CITY · LIVE MARKETPLACE
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight">Kampala City Live</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find the building. Find the shop. Buy the item.
        </p>

        <div className="mt-8 space-y-2.5">
          <Link
            to="/"
            className="block rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Enter the city
          </Link>
          <Link
            to="/auth"
            className="block rounded-2xl border border-border bg-card py-3 text-sm font-bold transition-colors hover:bg-secondary"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
