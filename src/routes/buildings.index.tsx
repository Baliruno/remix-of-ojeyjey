import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { buildings } from "@/lib/city-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/buildings/")({
  head: () => ({
    meta: [
      { title: "Kampala Building Directory — Floors, Units & Shops" },
      {
        name: "description",
        content:
          "Browse Kampala commercial buildings, malls and markets. Open a building to see its floors, shop units and registered sellers.",
      },
      { property: "og:title", content: "Kampala Building Directory" },
      {
        property: "og:description",
        content: "Commercial buildings, malls and markets across Kampala.",
      },
    ],
  }),
  component: BuildingsPage,
});

function BuildingsPage() {
  return (
    <CityShell>
      <section>
        <SectionHead
          title="Building directory"
          sub={`${buildings.length} buildings loaded from the Kampala city list`}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {buildings.map((b) => (
            <article key={b.id} className="surface overflow-hidden">
              <div className="tile-art flex h-24 items-end justify-between p-3">
                <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Building2 className="size-5" />
                </span>
                <span className="num text-lg opacity-70">{b.code}</span>
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold">{b.name}</h2>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                    {b.status}
                  </span>
                </div>
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
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">
                    {b.goods} goods
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {b.source}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/buildings/$id" params={{ id: b.id }}>
                      Open Building
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/buildings/$id/add-shop" params={{ id: b.id }}>
                      Add Shop
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </CityShell>
  );
}
