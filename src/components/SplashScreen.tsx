export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary text-primary-foreground">
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/30 opacity-40" />
          <img
            src="/__l5e/assets-v1/186e0be6-8071-4ce9-853d-d99787caa1e0/logo.png"
            alt="Kampala City Live logo"
            className="relative h-24 w-24 rounded-2xl object-contain shadow-soft"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Kampala City Live</h1>
          <p className="text-sm font-medium opacity-80">Loading marketplace…</p>
        </div>
      </div>
      <div className="absolute bottom-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-60">
        <span className="size-1.5 animate-pulse rounded-full bg-accent" />
        Connecting the city
      </div>
    </div>
  );
}
