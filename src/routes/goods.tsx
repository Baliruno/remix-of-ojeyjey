import { createFileRoute } from "@tanstack/react-router";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { goods, formatUgx } from "@/lib/city-data";

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
    ],
  }),
  component: GoodsPage,
});

function GoodsPage() {
  return (
    <CityShell>
      <section>
        <SectionHead title="Goods listed" sub="Every item currently available in the marketplace" />
        <div className="grid gap-3 sm:grid-cols-2">
          {goods.map((g) => (
            <article key={g.id} className="surface overflow-hidden">
              <div className="tile-art grid h-24 place-items-center text-2xl">🛍</div>
              <div className="space-y-1 p-3">
                <h2 className="text-sm font-bold">{g.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {g.shop} · {g.building}
                </p>
                <p className="num pt-1 text-base font-semibold">{formatUgx(g.price)}</p>
                <p className="text-[11px] text-muted-foreground">{g.unit}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </CityShell>
  );
}