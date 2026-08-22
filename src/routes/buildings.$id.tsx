import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { buildings } from "@/lib/city-data";

export const Route = createFileRoute("/buildings/$id")({
  loader: ({ params }) => {
    const building = buildings.find((b) => b.id === params.id);
    if (!building) throw notFound();
    return { building };
  },
  component: BuildingLayout,
});

function BuildingLayout() {
  return <Outlet />;
}
