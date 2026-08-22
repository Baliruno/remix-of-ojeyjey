import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Kampala City Live" },
      {
        name: "description",
        content: "Choose a new password for your Kampala City Live marketplace account.",
      },
      { property: "og:title", content: "Reset your Kampala City Live password" },
      { property: "og:description", content: "Set a new password for your marketplace account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/account", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="surface w-full max-w-sm p-5">
        <h1 className="text-2xl font-bold leading-tight">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Open this page from the reset link in your email, then choose a new password.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-2.5">
          <input
            className="field"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
