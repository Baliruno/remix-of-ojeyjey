import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { shops } from "@/lib/city-data";

export const Route = createFileRoute("/shops")({
  head: () => ({
    meta: [
      { title: "Kampala Shops — Registered Storefronts by Building" },
      {
        name: "description",
        content:
          "See registered Kampala shops with their building, floor and unit number, plus the goods each seller has listed.",
      },
      { property: "og:title", content: "Kampala Shops Directory" },
      {
        property: "og:description",
        content: "Registered storefronts with building, floor and unit details.",
      },
    ],
  }),
  component: ShopsPage,
});

function ShopsPage() {
  return (
    <CityShell>
      <section>
        <SectionHead title="Shops live" sub="Registered storefronts inside Kampala buildings" />
        <div className="surface divide-y divide-border">
          {shops.map((s) => (
            <article key={s.id} className="flex items-center gap-3 p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                <Store className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold">{s.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {s.building} · {s.floor} · {s.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="num text-sm font-semibold">{s.goods}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">goods</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface p-4">
        <h2 className="text-lg font-bold">Register your shop</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a building, choose the floor and unit, then list your goods.
        </p>
        <div className="mt-3 grid gap-2">
          <input
            placeholder="Shop name"
            className="h-11 rounded-2xl bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            placeholder="Building"
            className="h-11 rounded-2xl bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="h-11 rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
            Register shop
          </button>
        </div>
      </section>
    </CityShell>
  );
}