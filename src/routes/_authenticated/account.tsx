import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { CityShell, PageHeader, SectionHead } from "@/components/city/CityShell";
import { listMyShops, deleteMyShop } from "@/lib/shops.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your account — Kampala City Live" },
      {
        name: "description",
        content: "Manage your Kampala City Live profile, display name and contact phone.",
      },
      { property: "og:title", content: "Your Kampala City Live account" },
      { property: "og:description", content: "Manage your marketplace profile details." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchMyShops = useServerFn(listMyShops);
  const removeShop = useServerFn(deleteMyShop);
  const { data: myShops = [] } = useQuery({
    queryKey: ["shops", "mine"],
    queryFn: () => fetchMyShops(),
  });

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setEmail(userData.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setPhone(data.phone ?? "");
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userData.user.id, display_name: displayName, phone });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <CityShell>
      <PageHeader
        eyebrow="Account"
        title="Your account"
        sub="Your profile is how sellers and buyers recognise you across the marketplace."
      />

      <section className="surface max-w-md p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Signed in as
        </p>
        <p className="mt-1 text-sm font-semibold">{email}</p>

        <form onSubmit={handleSave} className="mt-5 space-y-2.5">
          <input
            className="field"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            className="field"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            Save profile
          </button>
        </form>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 w-full rounded-2xl border border-border bg-card py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
        >
          Sign out
        </button>
      </section>

      <section className="max-w-md">
        <SectionHead
          title="Your shops"
          sub={myShops.length ? `${myShops.length} registered` : "You have not registered a shop yet"}
        />
        {myShops.length === 0 ? (
          <div className="surface p-4 text-sm text-muted-foreground">
            Open a building from the{" "}
            <Link to="/buildings" className="font-semibold text-primary">
              buildings directory
            </Link>{" "}
            and tap Add Shop to register one.
          </div>
        ) : (
          <div className="surface divide-y divide-border">
            {myShops.map((s) => (
              <article key={s.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {s.building_name}
                    {[s.floor, s.unit].filter(Boolean).length
                      ? ` · ${[s.floor, s.unit].filter(Boolean).join(" · ")}`
                      : ""}
                  </p>
                </div>
                <Link
                  to="/shops/$shopId/goods"
                  params={{ shopId: s.id }}
                  className="text-xs font-semibold text-primary"
                >
                  Goods
                </Link>
                <button
                  type="button"
                  className="text-xs font-semibold text-destructive"
                  onClick={async () => {
                    try {
                      await removeShop({ data: { id: s.id } });
                      await queryClient.invalidateQueries({ queryKey: ["shops"] });
                      toast.success("Shop removed");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not remove shop");
                    }
                  }}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </CityShell>
  );
}
