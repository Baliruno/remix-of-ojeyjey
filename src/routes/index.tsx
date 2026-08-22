import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ChevronRight, PackageSearch, Plus, Search, Store } from "lucide-react";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { buildings, cityStats, formatCount } from "@/lib/city-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kampala City Live — Buildings, Shops & Goods Marketplace" },
      {
        name: "description",
        content:
          "Find the building, find the shop, buy the item. Kampala's commercial buildings, floors, shop units, sellers and goods in one live marketplace.",
      },
      { property: "og:title", content: "Kampala City Live Marketplace" },
      {
        property: "og:description",
        content: "Browse Kampala buildings, floors, shops and goods — live.",
      },
    ],
  }),
  component: Index,
});

const stats = [
  { value: formatCount(cityStats.buildings), label: "Buildings", dot: "bg-signal-green" },
  { value: formatCount(cityStats.shops), label: "Shops live", dot: "bg-signal-yellow" },
  { value: formatCount(cityStats.goods), label: "Goods", dot: "bg-signal-red" },
  { value: formatCount(cityStats.requests), label: "Requests", dot: "bg-signal-blue" },
  { value: formatCount(cityStats.orders), label: "Orders", dot: "bg-signal-cyan" },
];

const sell = [
  { title: "Add a shop", sub: "Register it inside a building", to: "/shops" as const },
  { title: "Add goods", sub: "List stock under a shop", to: "/goods" as const },
  { title: "Manage shops", sub: "Open the shop directory", to: "/shops" as const },
];

const buy = [
  { title: "Browse goods", sub: "Search all listed stock", to: "/goods" as const },
  { title: "Request an item", sub: "Ask sellers when you cannot find it", to: "/requests" as const },
  { title: "Track orders", sub: "Follow active purchases", to: "/orders" as const },
];

const signals = [
  { value: cityStats.shops, name: "SHOPS LIVE", sub: "registered storefronts", tag: "GREEN · ACTIVE", dot: "bg-signal-green" },
  { value: cityStats.goods, name: "GOODS LIVE", sub: "items listed", tag: "YELLOW · NEW STOCK", dot: "bg-signal-yellow" },
  { value: cityStats.requests, name: "DEMAND LIVE", sub: "buyer requests", tag: "RED · NEEDS ACTION", dot: "bg-signal-red" },
  { value: cityStats.orders, name: "ORDERS LIVE", sub: "active fulfilment", tag: "BLUE · IN MOTION", dot: "bg-signal-blue" },
  { value: cityStats.chats, name: "CHATS LIVE", sub: "seller conversations", tag: "CYAN · CONNECTED", dot: "bg-signal-cyan" },
];

function Index() {
  return (
    <CityShell>
      <section className="hero-panel relative overflow-hidden p-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/12 px-3 py-1 text-[10px] font-bold tracking-widest">
          <span className="size-1.5 rounded-full bg-signal-red" />
          KAMPALA CITY · LIVE MARKETPLACE
        </span>
        <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl">
          Find the building. Find the shop. Buy the item.
        </h1>
        <p className="mt-3 max-w-md text-sm opacity-80">
          The city is organised around real commercial buildings, their floors, shop units, sellers
          and goods — all connected in one marketplace.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/buildings"
            className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground"
          >
            Explore buildings
          </Link>
          <Link to="/shops" className="rounded-2xl bg-primary-foreground/15 px-4 py-2.5 text-sm font-bold">
            Add your shop
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/15" />
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="surface p-3">
            <span className={`block size-1.5 rounded-full ${s.dot}`} />
            <p className="num mt-2 text-xl font-semibold">{s.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      <section>
        <SectionHead
          title="Buildings in Kampala"
          sub="Open a building to see its floors and shops"
          action="View all"
          to="/buildings"
        />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {buildings.slice(0, 5).map((b) => (
            <article key={b.id} className="surface w-64 shrink-0 snap-start overflow-hidden">
              <div className="tile-art relative flex h-28 items-end justify-between p-3">
                <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Building2 className="size-5" />
                </span>
                <span className="num text-lg opacity-70">{b.code}</span>
              </div>
              <div className="space-y-2 p-3">
                <h3 className="font-bold">{b.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {b.area} · {b.kind}
                </p>
                <div className="flex gap-1.5">
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">
                    {b.shops} shops
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">
                    {b.floors} floors
                  </span>
                </div>
                <Link
                  to="/buildings"
                  className="mt-1 block rounded-2xl bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground"
                >
                  Open building
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Quick actions" sub="Only actions that actually do what they say" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { head: "Sell in Kampala", sub: "Shops and stock", Icon: Plus, items: sell },
            { head: "Buy in Kampala", sub: "Find, compare and track", Icon: Search, items: buy },
          ].map((group) => (
            <div key={group.head} className="surface p-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
                  <group.Icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{group.head}</p>
                  <p className="text-xs text-muted-foreground">{group.sub}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {group.items.map((i) => (
                  <Link
                    key={i.title}
                    to={i.to}
                    className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span>
                      <span className="block text-sm font-semibold">{i.title}</span>
                      <span className="block text-[11px] text-muted-foreground">{i.sub}</span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Live signals" sub="Live marketplace conditions" />
        <div className="grid gap-2 sm:grid-cols-2">
          {signals.map((s) => (
            <div key={s.name} className="surface flex items-center gap-3 p-3">
              <span className="num grid size-14 shrink-0 place-items-center rounded-2xl bg-muted text-base font-semibold">
                {formatCount(s.value)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground">
                  <span className={`size-1.5 rounded-full ${s.dot}`} />
                  {s.tag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Latest city activity" sub="Real actions from shops, buyers and orders" />
        <div className="surface divide-y divide-border">
          {[
            { Icon: Building2, title: "Building directory ready", sub: "253 Kampala buildings available", tag: "LIVE" },
            { Icon: Store, title: "Shops connected", sub: "4 active storefronts", tag: "NOW" },
            { Icon: PackageSearch, title: "Marketplace searchable", sub: "4 goods available to find", tag: "NOW" },
          ].map((a) => (
            <div key={a.title} className="flex items-center gap-3 p-3">
              <span className="grid size-9 place-items-center rounded-xl bg-muted text-primary">
                <a.Icon className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.sub}</p>
              </div>
              <span className="num text-[10px] font-bold text-muted-foreground">{a.tag}</span>
            </div>
          ))}
        </div>
      </section>
    </CityShell>
  );
}
