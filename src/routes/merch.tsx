import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/merch")({
  component: () => <Outlet />,
});
