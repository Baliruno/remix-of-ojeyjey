import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CityShell, PageHeader, SectionHead } from "@/components/city/CityShell";
import { listMyShops } from "@/lib/shops.functions";
import { addGood, listShopGoods, updateGoodStock, deleteGood } from "@/lib/goods.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/shops/$shopId/goods")({
  head: () => ({
    meta: [
      { title: "Manage shop goods — Kampala City Live" },
      {
        name: "description",
        content: "Add, restock and remove the goods your Kampala shop sells to buyers.",
      },
      { property: "og:title", content: "Manage your shop goods" },
      { property: "og:description", content: "List what your shop sells on Kampala City Live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManageGoodsPage,
});

function ManageGoodsPage() {
  const { shopId } = Route.useParams();
  const queryClient = useQueryClient();

  const fetchMyShops = useServerFn(listMyShops);
  const fetchGoods = useServerFn(listShopGoods);
  const createGood = useServerFn(addGood);
  const setStock = useServerFn(updateGoodStock);
  const removeGood = useServerFn(deleteGood);

  const { data: myShops = [] } = useQuery({ queryKey: ["shops", "mine"], queryFn: () => fetchMyShops() });
  const shop = myShops.find((s) => s.id === shopId);

  const { data: goods = [] } = useQuery({
    queryKey: ["goods", shopId],
    queryFn: () => fetchGoods({ data: { shopId } }),
  });

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);

  function clearImage() {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Give the item a name");
      return;
    }
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        toast.error("Photo must be an image file");
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error("Photo must be under 5 MB");
        return;
      }
    }
    setBusy(true);
    try {
      let imagePath = "";
      if (imageFile) {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) throw new Error("Please sign in again");
        const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("goods-images")
          .upload(path, imageFile, {
            contentType: imageFile.type || "application/octet-stream",
          });
        if (upErr) throw new Error(upErr.message);
        imagePath = path;
      }
      await createGood({
        data: {
          shopId,
          name: name.trim(),
          price: price.trim() ? Number(price) : null,
          unit: unit.trim(),
          category: category.trim(),
          description: description.trim(),
          inStock: true,
          imagePath,
        },
      });
      setName("");
      setPrice("");
      setUnit("");
      setCategory("");
      setDescription("");
      clearImage();
      await queryClient.invalidateQueries({ queryKey: ["goods", shopId] });
      toast.success("Item added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add item");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CityShell>
      <PageHeader
        eyebrow="Your shop"
        title={shop ? `${shop.name} — goods` : "Shop goods"}
        sub={
          shop
            ? `${shop.building_name}${[shop.floor, shop.unit].filter(Boolean).length ? ` · ${[shop.floor, shop.unit].filter(Boolean).join(" · ")}` : ""}`
            : "List everything this shop sells."
        }
      />

      {myShops.length > 0 && !shop ? (
        <div className="surface p-4 text-sm text-muted-foreground">
          This shop is not one of yours.{" "}
          <Link to="/account" className="font-semibold text-primary">
            Back to your account
          </Link>
        </div>
      ) : null}

      <section className="surface max-w-md p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Add an item
        </p>
        <form onSubmit={handleAdd} className="mt-4 space-y-2.5">
          <input className="field" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              className="field"
              placeholder="Price (UGX)"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input className="field" placeholder="Unit (kg, piece)" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <input className="field" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <textarea
            className="field min-h-20"
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="block text-xs font-semibold text-muted-foreground">
            Photo (optional)
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-bold"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {imagePreview ? (
            <div className="flex items-center gap-3 rounded-xl bg-muted p-2">
              <img src={imagePreview} alt="Item photo preview" className="h-14 w-14 rounded-lg object-cover" />
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{imageFile?.name}</p>
              <button
                type="button"
                className="shrink-0 text-xs font-semibold text-destructive"
                onClick={clearImage}
              >
                Remove
              </button>
            </div>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            Add item
          </button>
        </form>
      </section>

      <section className="max-w-md">
        <SectionHead title="Goods listed" sub={goods.length ? `${goods.length} item(s)` : "Nothing listed yet"} />
        {goods.length === 0 ? (
          <div className="surface p-4 text-sm text-muted-foreground">
            Add your first item above so buyers can find it.
          </div>
        ) : (
          <div className="surface divide-y divide-border">
            {goods.map((g) => (
              <article key={g.id} className="flex items-center gap-3 p-3">
                {g.image_url ? (
                  <img
                    src={g.image_url}
                    alt={g.name}
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold">{g.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {[
                      g.price != null ? `UGX ${Number(g.price).toLocaleString()}` : null,
                      g.unit ? `per ${g.unit}` : null,
                      g.category,
                      g.in_stock ? "In stock" : "Out of stock",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary"
                  onClick={async () => {
                    try {
                      await setStock({ data: { id: g.id, inStock: !g.in_stock } });
                      await queryClient.invalidateQueries({ queryKey: ["goods", shopId] });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not update item");
                    }
                  }}
                >
                  {g.in_stock ? "Mark out" : "Restock"}
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-destructive"
                  onClick={async () => {
                    try {
                      await removeGood({ data: { id: g.id } });
                      await queryClient.invalidateQueries({ queryKey: ["goods", shopId] });
                      toast.success("Item removed");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not remove item");
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
