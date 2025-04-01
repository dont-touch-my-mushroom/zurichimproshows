"use client"

import { notFound } from "next/navigation"
import { getFestivalByIdAction } from "@/actions/festivals-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Globe, Instagram, InfoIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { languageOptions } from "@/lib/language-options"
import { useAuth } from "@clerk/nextjs"
import { SignInButton } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { SelectFestival } from "@/db/schema/festivals-schema"
import { formatDateRange } from "@/lib/date-utils"
import ReactMarkdown from "react-markdown"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"

interface FestivalPageProps {
  params: Promise<{
    id: string
  }>
}

export default function FestivalPage({ params }: FestivalPageProps) {
  const { isSignedIn, userId } = useAuth()
  const [festival, setFestival] = useState<SelectFestival | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [festivalId, setFestivalId] = useState<string>("")

  useEffect(() => {
    const initialize = async () => {
      const { id } = await params
      setFestivalId(id)
      const result = await getFestivalByIdAction(id)
      if (result.status === "success" && result.data) {
        setFestival(result.data)
      }
      setIsLoading(false)
    }
    initialize()
  }, [params])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!festival) {
    notFound()
  }

  // Get language names from codes
  const languages = festival.languages ? festival.languages
    .map((code: string) => languageOptions.find(lang => lang.code === code)?.name || code)
    .join(", ") : ""

  const isOwner = isSignedIn && userId === festival.userId

  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{festival.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{festival.city}, {festival.country}</p>
            </div>
            {isOwner ? (
              <Button asChild>
                <Link href={`/festivals/edit/${festivalId}`}>Edit Festival</Link>
              </Button>
            ) : isSignedIn ? (
                <Button variant="outline" className="group relative">
                  Edit Festival
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    You don&apos;t have permission to edit this festival
                  </span>
                </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="outline" className="group relative">
                  Edit Festival
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign in to edit
                  </span>
                </Button>
              </SignInButton>
            )}
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

          <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDateRange(festival.dateFrom, festival.dateUntil)}</span>
            </div>
            <div className="flex items-center gap-4">
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
          </div>

          {festival.slogan && (
            <p className="text-xl italic text-muted-foreground">{festival.slogan}</p>
          )}

          <div className="prose max-w-none">

            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                  a: ({...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                  blockquote: ({...props}) => <blockquote className="pl-4 border-l-4 border-gray-300 my-2 italic" {...props} />,
                  code: ({className, children, ...props}: React.HTMLProps<HTMLElement> & {inline?: boolean}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return props.inline ? (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className={cn("bg-gray-100 dark:bg-gray-800 p-2 rounded my-2", className)}>
                        <code className={match ? `language-${match[1]}` : ''} {...props}>
                          {children}
                        </code>
                      </pre>
                    )
                  },
                  p: ({...props}) => <p className="my-2" {...props} />,
                  hr: () => <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />,
                  img: ({src, alt, ...props}) => {
                    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
                      return (
                        <Image 
                          src={src} 
                          alt={alt || 'Festival image'} 
                          width={800} 
                          height={600} 
                          className="max-w-full rounded my-2"
                        />
                      );
                    }
                    return <img src={src} alt={alt || 'Festival image'} className="max-w-full rounded my-2" {...props} />;
                  }
                }}
              >
                {festival.description}
              </ReactMarkdown>
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
                {festival.mixerShows && (
                  <li className="flex items-center gap-1">
                    ✓ Mixer shows included
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mixer shows are shows where participants of workshops can showcase their work.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 