import { createFileRoute } from "@tanstack/react-router";
import { CityShell, SectionHead } from "@/components/city/CityShell";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Request an Item in Kampala — Tell Sellers What You Need" },
      {
        name: "description",
        content:
          "Cannot find an item? Post a buyer request and Kampala sellers in registered shops respond with prices and availability.",
      },
      { property: "og:title", content: "Request an Item — Kampala City Live" },
      {
        property: "og:description",
        content: "Post buyer demand and let Kampala sellers come to you.",
      },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  return (
    <CityShell>
      <section className="surface p-4">
        <SectionHead title="Request an item" sub="Sellers see your request and reply with prices" />
        <div className="grid gap-2">
          <input
            placeholder="What are you looking for?"
            className="h-11 rounded-2xl bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            placeholder="Preferred area (e.g. Kisenyi)"
            className="h-11 rounded-2xl bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <textarea
            rows={3}
            placeholder="Details: quantity, budget, when you need it"
            className="rounded-2xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="h-11 rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
            Post request
          </button>
        </div>
      </section>

      <section>
        <SectionHead title="Buyer demand" sub="Open requests waiting for a seller" />
        <div className="surface grid place-items-center gap-1 p-8 text-center">
          <span className="num text-2xl font-semibold">000</span>
          <p className="text-sm font-semibold">No open requests yet</p>
          <p className="text-xs text-muted-foreground">
            Post the first request and it will appear here in red.
          </p>
        </div>
      </section>
    </CityShell>
  );
}