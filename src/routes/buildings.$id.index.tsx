import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Store } from "lucide-react";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { buildings, shops } from "@/lib/city-data";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/buildings/$id/")({
  head: ({ params }) => {
    const building = buildings.find((b) => b.id === params.id);
    const title = building ? `${building.name} — Kampala Building Directory` : "Building Directory";
    const description = building
      ? `View ${building.name} details, floors, shops and registered sellers.`
      : "Browse Kampala buildings, floors, shops and goods.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: BuildingDetailPage,
});

function BuildingDetailPage() {
  const { id } = Route.useParams();
  const building = buildings.find((b) => b.id === id);
  if (!building) throw notFound();
  const buildingShops = shops.filter((s) => s.building === building.name);
  const { user } = useAuth();
  const { data: registered = [] } = useQuery({
    queryKey: ["shops", "building", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("id, name, floor, unit, category, owner_id, created_at")
        .eq("building_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const totalShops = buildingShops.length + registered.length;

  return (
    <CityShell>
      <section>
        <div className="surface overflow-hidden">
          <div className="tile-art flex h-32 items-end justify-between p-4">
            <span className="grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="size-6" />
            </span>
            <span className="num text-2xl opacity-70">{building.code}</span>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold">{building.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {building.area} · {building.kind}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {building.status}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                {building.shops} shops
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                {building.floors} floors
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                {building.goods} goods
              </span>
            </div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {building.source}
            </p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" asChild>
                <Link to="/buildings/$id/add-shop" params={{ id: building.id }}>
                  Add Shop
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/buildings">Back to buildings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHead
          title="Shops in this building"
          sub={
            totalShops
              ? `${totalShops} registered shop${totalShops === 1 ? "" : "s"}`
              : "No shops registered yet"
          }
        />
        {totalShops === 0 ? (
          <div className="surface p-4 text-center">
            <p className="text-sm text-muted-foreground">No shops registered in this building yet.</p>
          </div>
        ) : (
          <div className="surface divide-y divide-border">
            {registered.map((s) => (
              <article key={s.id} className="flex items-center gap-3 p-3">
                <Link
                  to="/shops/$shopId"
                  params={{ shopId: s.id }}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Store className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold">{s.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {[s.floor, s.unit, s.category].filter(Boolean).join(" · ") || "Newly registered"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary">View items</span>
                </Link>
                {user && s.owner_id === user.id ? (
                  <Link
                    to="/shops/$shopId/goods"
                    params={{ shopId: s.id }}
                    className="shrink-0 text-xs font-semibold text-primary"
                  >
                    Add goods
                  </Link>
                ) : null}
              </article>
            ))}
            {buildingShops.map((s) => (
              <article key={s.id} className="flex items-center gap-3 p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Store className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold">{s.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {s.floor} · {s.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-sm font-semibold">{s.goods}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">goods</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </CityShell>
  );
}
