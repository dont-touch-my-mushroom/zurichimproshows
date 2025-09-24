import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, ClockIcon, MapPinIcon, TicketIcon, UsersIcon } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SelectShow } from "@/db/schema/shows-schema"
import { format } from "date-fns"

interface ShowCardProps {
  show: SelectShow
}

export function ShowCard({ show }: ShowCardProps) {
  const formatShowTime = (date: Date | string) => {
    const showDate = typeof date === 'string' ? new Date(date) : date
    return format(showDate, "MMM d 'at' p")
  }

  return (
    <Card className="overflow-hidden border shadow-sm">
      <div className="relative aspect-[16/9] overflow-hidden">
        {show.poster ? (
          <Link href={`/shows/${show.id}`}>
            <Image
              src={show.poster || "/placeholder.svg"}
              alt={`${show.name} poster`}
              fill
              className="object-cover"
            />
          </Link>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No poster available</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold">{show.name}</h3>
        
        {/* Location */}
        {show.locationName && (
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <MapPinIcon className="mr-1 h-4 w-4" />
            <span>{show.locationName}</span>
          </div>
        )}

        {/* Show Time */}
        <div className="mt-1 flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <span>{formatShowTime(show.showStarts)}</span>
        </div>

        {/* Doors Open */}
        <div className="mt-1 flex items-center text-sm text-muted-foreground">
          <ClockIcon className="mr-1 h-4 w-4" />
          <span>Doors: {formatShowTime(show.doorsOpen)}</span>
        </div>

        {/* Groups */}
        {show.groups && show.groups.length > 0 && (
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <UsersIcon className="mr-1 h-4 w-4" />
            <span>{show.groups.join(", ")}</span>
          </div>
        )}

        {/* Ticket Price */}
        {show.ticketPrice && (
          <div className="mt-2 flex items-center text-sm font-medium text-primary">
            <TicketIcon className="mr-1 h-4 w-4" />
            <span>{show.ticketPrice}</span>
          </div>
        )}

        {/* Slogan */}
        {show.slogan && <p className="mt-2 text-sm text-muted-foreground">{show.slogan}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="default" className="w-full">
          <Link href={`/shows/${show.id}`}>More about show</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}