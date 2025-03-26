import { FestivalCard } from "@/components/card/festival-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllFestivalsAction } from "@/actions/festivals-actions";
import { SelectFestival } from "@/db/schema/festivals-schema";

export default async function ListPage() {
  const response = await getAllFestivalsAction();
  const festivals = (response.status === "success" ? response.data : []) as SelectFestival[];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">List Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {festivals.map((festival) => (
          <FestivalCard key={festival.id} festival={festival} />
        ))}
      </div>
    </div>
  )
} 