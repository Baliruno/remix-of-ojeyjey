import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Phone, Store } from "lucide-react";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { listShopGoods } from "@/lib/goods.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatUgx } from "@/lib/city-data";

export const Route = createFileRoute("/shops_/$shopId")({
  head: () => ({
    meta: [
      { title: "Shop Goods & Prices — Kampala City Live" },
      {
        name: "description",
        content: "Browse the items this Kampala shop has in stock, with photos, prices and availability.",
      },
      { property: "og:title", content: "Shop goods on Kampala City Live" },
      { property: "og:description", content: "See what this shop sells — photos, prices and stock status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShopDetailPage,
});

function ShopDetailPage() {
  const { shopId } = Route.useParams();
  const fetchGoods = useServerFn(listShopGoods);

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("id, name, building_id, building_name, floor, unit, category, phone, description")
        .eq("id", shopId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: goods = [], isLoading: goodsLoading } = useQuery({
    queryKey: ["goods", shopId],
    queryFn: () => fetchGoods({ data: { shopId } }),
  });

  return (
    <CityShell>
      <section className="surface overflow-hidden">
        <div className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Store className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">
                {shopLoading ? "Loading shop…" : (shop?.name ?? "Shop not found")}
              </h1>
              {shop ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[
                    shop.building_name,
                    [shop.floor, shop.unit].filter(Boolean).join(" · ") || null,
                    shop.category,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
          {shop?.description ? <p className="text-sm text-muted-foreground">{shop.description}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            {shop?.phone ? (
              <a
                href={`tel:${shop.phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold"
              >
                <Phone className="size-3" />
                {shop.phone}
              </a>
            ) : null}
            {shop?.building_id ? (
              <Link
                to="/buildings/$id"
                params={{ id: shop.building_id }}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary"
              >
                <ArrowLeft className="size-3" />
                Back to {shop.building_name}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <SectionHead
          title="Items for sale"
          sub={
            goodsLoading
              ? "Loading items…"
              : goods.length
                ? `${goods.length} item${goods.length === 1 ? "" : "s"} listed`
                : "Nothing listed yet"
          }
        />
        {goods.length === 0 && !goodsLoading ? (
          <div className="surface p-4 text-center text-sm text-muted-foreground">
            This shop has not listed any items yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {goods.map((g) => (
              <article key={g.id} className="surface overflow-hidden">
                {g.image_url ? (
                  <img
                    src={g.image_url}
                    alt={g.name}
                    loading="lazy"
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="tile-art grid h-24 place-items-center text-2xl">🛍</div>
                )}
                <div className="space-y-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-bold">{g.name}</h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        g.in_stock ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {g.in_stock ? "In stock" : "Out of stock"}
                    </span>
                  </div>
                  {g.category ? <p className="text-xs text-muted-foreground">{g.category}</p> : null}
                  {g.description ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{g.description}</p>
                  ) : null}
                  {g.price != null ? (
                    <p className="num pt-1 text-base font-semibold">
                      {formatUgx(Number(g.price))}
                      {g.unit ? <span className="text-[11px] font-normal text-muted-foreground"> / {g.unit}</span> : null}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </CityShell>
  );
}
