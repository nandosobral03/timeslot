import { api } from "@/trpc/server";

export default async function BrowseStationsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { page = "1", limit = "10" } = await searchParams;

  const stations = await api.stations.listStations({ page: Number(page), pageSize: Number(limit) });

  return <pre>{JSON.stringify(stations, null, 2)}</pre>;
}
