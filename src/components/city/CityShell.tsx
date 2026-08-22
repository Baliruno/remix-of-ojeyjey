import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ClipboardList,
  Compass,
  Home,
  PackageSearch,
  Plus,
  Search,
  Store,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoAsset from "@/assets/logo.png.asset.json";


const chips = [
  { label: "Buildings", to: "/buildings" },
  { label: "Shops", to: "/shops" },
  { label: "Goods", to: "/goods" },
  { label: "Requests", to: "/requests" },
  { label: "Orders", to: "/orders" },
] as const;

const nav = [
  { label: "Home", to: "/", Icon: Home },
  { label: "Discover", to: "/buildings", Icon: Compass },
  { label: "Request", to: "/requests", Icon: Plus, primary: true },
  { label: "Orders", to: "/orders", Icon: ClipboardList },
  { label: "Shops", to: "/shops", Icon: Store },
] as const;

export function CityShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-5xl px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={logoAsset.url}
                alt="Kampala City Live logo"
                className="size-9 rounded-xl object-contain"
              />
              <span className="leading-tight">
                <span className="block font-display text-lg font-bold tracking-tight">
                  Kampala City
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Live marketplace
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold tracking-wider sm:flex">
                <span className="size-2 animate-pulse rounded-full bg-signal-green" />
                LIVE
              </span>
              {loading ? null : isAuthenticated ? (
                <Link
                  to="/account"
                  aria-label="Your account"
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold tracking-wider transition-colors hover:bg-secondary"
                >
                  <UserRound className="size-3.5" />
                  ACCOUNT
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
                >
                  SIGN IN
                </Link>
              )}
            </div>
          </div>


          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search a building, shop or product..."
                className="field pl-10 placeholder:text-muted-foreground"
              />
            </div>
            <button
              aria-label="Search"
              className="grid h-[2.85rem] w-[2.85rem] shrink-0 place-items-center rounded-[calc(var(--radius)-0.25rem)] bg-primary text-primary-foreground transition-opacity hover:opacity-90"
            >
              <PackageSearch className="size-4.5" />
            </button>
          </div>

          <nav className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((c) => (
              <Link
                key={c.label}
                to={c.to}
                activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
                inactiveProps={{
                  className: "bg-card text-muted-foreground border-border hover:text-foreground",
                }}
                className="whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-36 pt-6">{children}</main>

      <div className="fixed inset-x-0 bottom-3 z-30 px-4">
        <nav className="surface mx-auto flex max-w-md items-center justify-between gap-1 rounded-3xl p-1.5">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              activeProps={{
                className:
                  "primary" in n && n.primary ? "" : "bg-secondary text-secondary-foreground",
              }}
              inactiveProps={{
                className: "primary" in n && n.primary ? "" : "text-muted-foreground",
              }}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-colors ${
                "primary" in n && n.primary ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <n.Icon className="size-4.5" />
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <section>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </span>
      <h1 className="mt-1.5 text-3xl font-bold leading-tight">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{sub}</p>
    </section>
  );
}

export function SectionHead({
  title,
  sub,
  action,
  to,
}: {
  title: string;
  sub: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
      {action && to ? (
        <Link
          to={to}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({
  code,
  title,
  sub,
}: {
  code: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="surface grid place-items-center gap-1.5 border-dashed p-10 text-center">
      <span className="num grid size-14 place-items-center rounded-2xl bg-muted text-lg font-semibold">
        {code}
      </span>
      <p className="mt-1 text-sm font-bold">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}