import { createFileRoute } from "@tanstack/react-router";
import { CityShell, SectionHead } from "@/components/city/CityShell";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Track Orders — Kampala City Live Marketplace" },
      {
        name: "description",
        content:
          "Follow active purchases from Kampala shops: order status, fulfilment progress and seller conversations in one place.",
      },
      { property: "og:title", content: "Track Orders — Kampala City Live" },
      {
        property: "og:description",
        content: "Follow active purchases and fulfilment from Kampala sellers.",
      },
    ],
  }),
  component: OrdersPage,
});

const stages = [
  { name: "Placed", tag: "BLUE", dot: "bg-signal-blue" },
  { name: "Seller confirmed", tag: "CYAN", dot: "bg-signal-cyan" },
  { name: "Ready in shop", tag: "YELLOW", dot: "bg-signal-yellow" },
  { name: "Collected", tag: "GREEN", dot: "bg-signal-green" },
];

function OrdersPage() {
  return (
    <CityShell>
      <section>
        <SectionHead title="Orders moving" sub="Active fulfilment across the city" />
        <div className="surface grid place-items-center gap-1 p-8 text-center">
          <span className="num text-2xl font-semibold">000</span>
          <p className="text-sm font-semibold">No orders in motion</p>
          <p className="text-xs text-muted-foreground">
            Checkout from any shop and the order appears here.
          </p>
        </div>
      </section>

      <section>
        <SectionHead title="How an order moves" sub="Each stage changes the live signal colour" />
        <div className="surface divide-y divide-border">
          {stages.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 p-3">
              <span className="num grid size-9 place-items-center rounded-xl bg-muted text-xs">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 text-sm font-semibold">{s.name}</p>
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground">
                <span className={`size-1.5 rounded-full ${s.dot}`} />
                {s.tag}
              </span>
            </div>
          ))}
        </div>
      </section>
    </CityShell>
  );
}