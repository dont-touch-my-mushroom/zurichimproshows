import { ShowCard } from "@/components/card/show-card";
import { getAllShowsAction } from "@/actions/shows-actions";
import { SelectShow } from "@/db/schema/shows-schema";

export default async function ListPage() {
  const response = await getAllShowsAction();
  const shows = (response.status === "success" ? response.data : []) as SelectShow[];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">All Shows</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  )
} 