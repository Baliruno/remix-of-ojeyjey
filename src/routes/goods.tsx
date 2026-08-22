import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { formatUgx } from "@/lib/city-data";
import { listAllGoods } from "@/lib/goods.functions";

const goodsQueryOptions = queryOptions({
  queryKey: ["goods", "all"],
  queryFn: () => listAllGoods(),
});

export const Route = createFileRoute("/goods")({
  head: () => ({
    meta: [
      { title: "Goods & Prices in Kampala — Compare Seller Listings" },
      {
        name: "description",
        content:
          "Browse goods listed by Kampala sellers, compare prices between shops and see exactly which building each item is sold in.",
      },
      { property: "og:title", content: "Kampala Goods & Prices" },
      {
        property: "og:description",
        content: "Compare listed prices from shops across Kampala buildings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(goodsQueryOptions),
  component: GoodsPage,
  errorComponent: ({ error }) => (
    <CityShell>
      <div role="alert" className="surface p-4 text-sm text-muted-foreground">
        Could not load goods: {error.message}
      </div>
    </CityShell>
  ),
  notFoundComponent: () => (
    <CityShell>
      <div className="surface p-4 text-sm text-muted-foreground">No goods found.</div>
    </CityShell>
  ),
});

function GoodsPage() {
  const { data: goods } = useSuspenseQuery(goodsQueryOptions);
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();
  const list = term
    ? goods.filter((g) =>
        [g.name, g.category, g.shop_name, g.building_name]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term)),
      )
    : goods;

  return (
    <CityShell>
      <section>
        <SectionHead
          title="Goods listed"
          sub={
            goods.length
              ? `${goods.length} item(s) from shops across Kampala`
              : "Every item currently available in the marketplace"
          }
        />

        <label className="surface mb-3 flex items-center gap-2 px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search item, category, shop or building"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        {list.length === 0 ? (
          <div className="surface p-4 text-sm text-muted-foreground">
            {goods.length === 0 ? (
              <>
                No goods listed yet.{" "}
                <Link to="/shops" className="font-semibold text-primary">
                  Add your shop
                </Link>{" "}
                and list your first item.
              </>
            ) : (
              "No items match that search."
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((g) => (
              <article key={g.id} className="surface overflow-hidden">
                {g.image_url ? (
                  <img
                    src={g.image_url}
                    alt={g.name}
                    loading="lazy"
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="tile-art grid h-24 place-items-center text-2xl">🛍</div>
                )}
                <div className="space-y-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-bold">{g.name}</h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        g.in_stock ? "bg-muted text-foreground" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {g.in_stock ? "In stock" : "Out"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[g.shop_name, g.building_name, g.shop_floor, g.shop_unit]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {g.price != null ? (
                    <p className="num pt-1 text-base font-semibold">{formatUgx(Number(g.price))}</p>
                  ) : (
                    <p className="pt-1 text-sm font-semibold text-muted-foreground">Ask for price</p>
                  )}
                  {g.unit ? <p className="text-[11px] text-muted-foreground">per {g.unit}</p> : null}
                  <Link
                    to="/shops/$shopId"
                    params={{ shopId: g.shop_id }}
                    className="mt-2 block rounded-2xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground"
                  >
                    View shop
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </CityShell>
  );
}
