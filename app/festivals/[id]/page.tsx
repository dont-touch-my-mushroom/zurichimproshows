import { notFound } from "next/navigation"
import { getFestivalByIdAction } from "@/actions/festivals-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Globe, Instagram } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { languageOptions } from "@/lib/language-options"

interface FestivalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FestivalPage({ params }: FestivalPageProps) {
  const { id } = await params
  const result = await getFestivalByIdAction(id)
  
  if (result.status !== "success" || !result.data) {
    notFound()
  }

  const festival = result.data

  // Get language names from codes
  const languages = festival.languages
    .map((code: string) => languageOptions.find(lang => lang.code === code)?.name || code)
    .join(", ")

  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{festival.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{festival.city}, {festival.country}</p>
            </div>
            <Button asChild>
              <Link href={`/festivals/edit/${festival.id}`}>Edit Festival</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {festival.poster && (
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <Image
                src={festival.poster}
                alt={`${festival.name} poster`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(new Date(festival.dateFrom), "PPP")} - {format(new Date(festival.dateUntil), "PPP")}
              </span>
            </div>
            {festival.website && (
              <Link href={festival.website} target="_blank" className="flex items-center gap-2 hover:text-primary">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </Link>
            )}
            {festival.instagram && (
              <Link href={`https://instagram.com/${festival.instagram}`} target="_blank" className="flex items-center gap-2 hover:text-primary">
                <Instagram className="h-4 w-4" />
                <span>@{festival.instagram}</span>
              </Link>
            )}
          </div>

          {festival.slogan && (
            <p className="text-xl italic text-muted-foreground">{festival.slogan}</p>
          )}

          <div className="prose max-w-none">
            <p>{festival.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Languages</h3>
              <p className="text-muted-foreground">{languages}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-1 text-muted-foreground">
                {festival.accommodationOffered && <li>✓ Accommodation offered</li>}
                {festival.mixerShows && <li>✓ Mixer shows included</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 