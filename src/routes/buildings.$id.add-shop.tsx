import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { buildings } from "@/lib/city-data";
import { createShop } from "@/lib/shops.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/buildings/$id/add-shop")({
  head: ({ params }) => {
    const building = buildings.find((b) => b.id === params.id);
    const title = building ? `Add Shop — ${building.name}` : "Add Shop";
    const description = building
      ? `Register a new shop inside ${building.name}.`
      : "Register a new shop inside a Kampala building.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ params }) => {
    const building = buildings.find((b) => b.id === params.id);
    if (!building) throw notFound();
    return { building };
  },
  component: AddShopPage,
});

function AddShopPage() {
  const { id } = Route.useParams();
  const building = buildings.find((b) => b.id === id);
  if (!building) throw notFound();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading } = useAuth();
  const submitShop = useServerFn(createShop);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await submitShop({
        data: {
          buildingId: building!.id,
          buildingName: building!.name,
          name: String(form.get("name") ?? ""),
          floor: String(form.get("floor") ?? ""),
          unit: String(form.get("unit") ?? ""),
          category: String(form.get("category") ?? ""),
          phone: String(form.get("phone") ?? ""),
          description: String(form.get("description") ?? ""),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast.success("Shop registered");
      navigate({ to: "/buildings/$id", params: { id: building!.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not register shop");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CityShell>
      <section>
        <SectionHead title="Add a shop" sub={`Register a new shop in ${building.name}`} />
        <div className="surface p-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{building.name}</p>
              <p className="text-xs text-muted-foreground">
                {building.area} · {building.kind}
              </p>
            </div>
          </div>

          {!loading && !isAuthenticated ? (
            <div className="rounded-2xl bg-muted/60 p-4 text-sm">
              <p>You need an account to register a shop.</p>
              <Button className="mt-3" asChild>
                <Link to="/auth">Sign in to continue</Link>
              </Button>
            </div>
          ) : (
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div className="grid gap-1.5">
                <Label htmlFor="shop-name">Shop name</Label>
                <Input id="shop-name" name="name" required minLength={2} placeholder="e.g. Kampala Fabrics" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" name="floor" placeholder="e.g. Floor 1" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="unit">Unit / Stall</Label>
                <Input id="unit" name="unit" placeholder="e.g. Unit A12" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g. Textiles" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Contact phone</Label>
                <Input id="phone" name="phone" placeholder="e.g. +256 700 000000" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="What do you sell?" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={busy}>
                  {busy ? "Registering…" : "Register shop"}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/buildings/$id" params={{ id: building.id }}>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </CityShell>
  );
}
