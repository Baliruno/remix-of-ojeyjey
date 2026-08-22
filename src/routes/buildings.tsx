import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/buildings")({
  component: BuildingsLayout,
});

function BuildingsLayout() {
  return <Outlet />;
}
