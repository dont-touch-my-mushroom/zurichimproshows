import Image from "next/image"
import Link from "next/link"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SelectFestival } from "@/db/schema/festivals-schema"


interface FestivalCardProps {
  festival: SelectFestival
}

export function FestivalCard({ festival }: FestivalCardProps) {
  // Format the dates
  const formattedDateRange = `${format(new Date(festival.dateFrom), "d")}–${format(
    new Date(festival.dateUntil),
    "d MMM yyyy",
  )}`

  return (
    <Card className="overflow-hidden border shadow-sm">
      <div className="relative aspect-[16/9] overflow-hidden">
        {festival.poster ? (
          <Image
            src={festival.poster || "/placeholder.svg"}
            alt={`${festival.name} poster`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No poster available</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold">{festival.name}</h3>
        <div className="mt-1 flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <span>{formattedDateRange}</span>
        </div>
        {festival.slogan && <p className="mt-2 text-sm text-muted-foreground">{festival.slogan}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="default" className="w-full">
          <Link href={`/festivals/${festival.id}`}>More about festival</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

