import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CityShell, SectionHead } from "@/components/city/CityShell";
import { formatUgx } from "@/lib/city-data";
import { useAuth } from "@/hooks/use-auth";
import {
  createRequest,
  deleteReply,
  deleteRequest,
  listRequests,
  replyToRequest,
  setRequestStatus,
  type ItemRequest,
} from "@/lib/requests.functions";

const requestsQueryOptions = queryOptions({
  queryKey: ["requests", "all"],
  queryFn: () => listRequests(),
});

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(requestsQueryOptions),
  component: RequestsPage,
  errorComponent: ({ error }) => (
    <CityShell>
      <div role="alert" className="surface p-4 text-sm text-muted-foreground">
        Could not load requests: {error.message}
      </div>
    </CityShell>
  ),
  notFoundComponent: () => (
    <CityShell>
      <div className="surface p-4 text-sm text-muted-foreground">No requests found.</div>
    </CityShell>
  ),
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function RequestsPage() {
  const { data: requests } = useSuspenseQuery(requestsQueryOptions);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const postRequest = useServerFn(createRequest);
  const [busy, setBusy] = useState(false);

  const open = requests.filter((r) => r.status === "open");
  const closed = requests.filter((r) => r.status !== "open");

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["requests"] });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    if (title.length < 3) {
      toast.error("Describe what you are looking for");
      return;
    }
    setBusy(true);
    try {
      await postRequest({
        data: {
          title,
          area: String(data.get("area") ?? ""),
          details: String(data.get("details") ?? ""),
        },
      });
      form.reset();
      await refresh();
      toast.success("Request posted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CityShell>
      <section className="surface p-4">
        <SectionHead title="Request an item" sub="Sellers see your request and reply with prices" />
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="grid gap-2">
            <input
              name="title"
              required
              maxLength={120}
              placeholder="What are you looking for?"
              className="h-11 rounded-2xl bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              name="area"
              maxLength={80}
              placeholder="Preferred area (e.g. Kisenyi)"
              className="h-11 rounded-2xl bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <textarea
              name="details"
              rows={3}
              maxLength={600}
              placeholder="Details: quantity, budget, when you need it"
              className="rounded-2xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={busy}
              className="h-11 rounded-2xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Posting…" : "Post request"}
            </button>
          </form>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">
              Sign in to post a request so sellers can reply to you.
            </p>
            <Link
              to="/auth"
              className="grid h-11 place-items-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
            >
              Sign in to post
            </Link>
          </div>
        )}
      </section>

      <section>
        <SectionHead title="Buyer demand" sub="Open requests waiting for a seller" />
        {open.length === 0 ? (
          <div className="surface grid place-items-center gap-1 p-8 text-center">
            <span className="num text-2xl font-semibold">000</span>
            <p className="text-sm font-semibold">No open requests yet</p>
            <p className="text-xs text-muted-foreground">
              Post the first request and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {open.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                currentUserId={user?.id ?? null}
                isAuthenticated={isAuthenticated}
                onChanged={refresh}
              />
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <section>
          <SectionHead title="Closed requests" sub="Already sorted out" />
          <div className="grid gap-3">
            {closed.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                currentUserId={user?.id ?? null}
                isAuthenticated={isAuthenticated}
                onChanged={refresh}
              />
            ))}
          </div>
        </section>
      )}
    </CityShell>
  );
}

function RequestCard({
  request,
  currentUserId,
  isAuthenticated,
  onChanged,
}: {
  request: ItemRequest;
  currentUserId: string | null;
  isAuthenticated: boolean;
  onChanged: () => Promise<void>;
}) {
  const sendReply = useServerFn(replyToRequest);
  const removeReply = useServerFn(deleteReply);
  const changeStatus = useServerFn(setRequestStatus);
  const removeRequest = useServerFn(deleteRequest);

  const [showReply, setShowReply] = useState(false);
  const [busy, setBusy] = useState(false);
  const isOwner = !!currentUserId && currentUserId === request.user_id;
  const isOpen = request.status === "open";

  async function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const message = String(data.get("message") ?? "").trim();
    if (message.length < 2) {
      toast.error("Write a short reply");
      return;
    }
    const rawPrice = String(data.get("price") ?? "").trim();
    setBusy(true);
    try {
      await sendReply({
        data: {
          requestId: request.id,
          message,
          price: rawPrice ? Number(rawPrice) : null,
        },
      });
      form.reset();
      setShowReply(false);
      await onChanged();
      toast.success("Reply sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reply");
    } finally {
      setBusy(false);
    }
  }

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      await onChanged();
      toast.success(ok);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="surface grid gap-3 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-bold">{request.title}</h3>
          <p className="text-xs text-muted-foreground">
            {request.author_name || "Buyer"} · {timeAgo(request.created_at)}
            {request.area ? ` · ${request.area}` : ""}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider ${
            isOpen ? "text-signal-red" : "text-muted-foreground"
          }`}
        >
          <span className={`size-1.5 rounded-full ${isOpen ? "bg-signal-red" : "bg-muted-foreground"}`} />
          {isOpen ? "OPEN" : "CLOSED"}
        </span>
      </div>

      {request.details && <p className="text-sm text-muted-foreground">{request.details}</p>}

      {request.replies.length > 0 && (
        <div className="grid gap-2 border-t border-border pt-3">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground">
            {request.replies.length} SELLER {request.replies.length === 1 ? "REPLY" : "REPLIES"}
          </p>
          {request.replies.map((reply) => (
            <div key={reply.id} className="rounded-2xl bg-muted p-3">
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs font-semibold">{reply.author_name || "Seller"}</p>
                {reply.price != null && (
                  <span className="num text-xs font-bold">{formatUgx(reply.price)}</span>
                )}
              </div>
              <p className="mt-1 text-sm">{reply.message}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
                {currentUserId === reply.user_id && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => removeReply({ data: { id: reply.id } }), "Reply deleted")}
                    className="text-[10px] font-bold text-signal-red"
                  >
                    DELETE
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isOpen && isAuthenticated && !isOwner && (
          <button
            type="button"
            onClick={() => setShowReply((v) => !v)}
            className="h-9 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground"
          >
            {showReply ? "Cancel" : "Reply as seller"}
          </button>
        )}
        {isOpen && !isAuthenticated && (
          <Link to="/auth" className="h-9 rounded-xl bg-muted px-4 text-xs font-bold leading-9">
            Sign in to reply
          </Link>
        )}
        {isOwner && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(
                  () => changeStatus({ data: { id: request.id, status: isOpen ? "closed" : "open" } }),
                  isOpen ? "Request closed" : "Request reopened",
                )
              }
              className="h-9 rounded-xl bg-muted px-4 text-xs font-bold"
            >
              {isOpen ? "Mark as sorted" : "Reopen"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => removeRequest({ data: { id: request.id } }), "Request deleted")}
              className="h-9 rounded-xl px-3 text-xs font-bold text-signal-red"
            >
              Delete
            </button>
          </>
        )}
      </div>

      {showReply && (
        <form onSubmit={handleReply} className="grid gap-2 border-t border-border pt-3">
          <textarea
            name="message"
            rows={2}
            required
            maxLength={500}
            placeholder="I have this in stock at my shop…"
            className="rounded-2xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            name="price"
            type="number"
            min={0}
            step="any"
            placeholder="Your price (UGX, optional)"
            className="h-11 rounded-2xl bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-2xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reply"}
          </button>
        </form>
      )}
    </article>
  );
}
