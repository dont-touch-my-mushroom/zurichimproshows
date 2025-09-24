import { notFound } from "next/navigation"
import { getShowByIdAction, canEditAction } from "@/actions/shows-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon, Globe, Instagram, MapPinIcon, TicketIcon, UsersIcon, MailIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { SignInButton } from "@clerk/nextjs"
import { SelectShow } from "@/db/schema/shows-schema"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"

interface ShowPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ShowPage({ params }: ShowPageProps) {
  const user = await currentUser()
  const isSignedIn = !!user
  
  const {id} = await params
  const result = await getShowByIdAction(id)
  
  if (result.status !== "success" || !result.data) {
    notFound()
  }
  
  const show: SelectShow = result.data
  const canEdit = await canEditAction(show.userId)

  const formatShowTime = (date: Date | string) => {
    const showDate = typeof date === 'string' ? new Date(date) : date
    return format(showDate, "EEEE, MMMM d, yyyy 'at' p")
  }

  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{show.name}</CardTitle>
              {show.locationName && (
                <p className="text-muted-foreground mt-1">{show.locationName}</p>
              )}
            </div>
            
            {/* Edit button with server-side conditional rendering */}
            {canEdit ? (
              <Button asChild>
                <Link href={`/shows/edit/${id}`}>Edit Show</Link>
              </Button>
            ) : !isSignedIn ? (
              <SignInButton mode="modal">
                <Button variant="outline">Edit Show</Button>
              </SignInButton>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {show.poster && (
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <Image
                src={show.poster}
                alt={`${show.name} poster`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Show Times */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5" />
              <span className="font-semibold">Show starts: {formatShowTime(show.showStarts)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              <span>Doors open: {formatShowTime(show.doorsOpen)}</span>
            </div>
          </div>

          {/* Ticket Information */}
          {(show.ticketPrice || show.ticketsLink) && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Tickets</h3>
              <div className="flex items-center gap-4">
                {show.ticketPrice && (
                  <div className="flex items-center gap-2 text-lg font-medium text-primary">
                    <TicketIcon className="h-5 w-5" />
                    <span>{show.ticketPrice}</span>
                  </div>
                )}
                {show.ticketsLink && (
                  <Button asChild>
                    <Link href={show.ticketsLink} target="_blank">
                      Buy Tickets
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Performing Groups */}
          {show.groups && show.groups.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Performing Groups</h3>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                <span className="text-muted-foreground">{show.groups.join(", ")}</span>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="flex items-center gap-6">
            {show.website && (
              <Link href={show.website} target="_blank" className="flex items-center gap-2 hover:text-primary">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </Link>
            )}
            {show.instagram && (
              <Link href={`https://instagram.com/${show.instagram}`} target="_blank" className="flex items-center gap-2 hover:text-primary">
                <Instagram className="h-4 w-4" />
                <span>@{show.instagram}</span>
              </Link>
            )}
            {show.email && (
              <Link href={`mailto:${show.email}`} className="flex items-center gap-2 hover:text-primary">
                <MailIcon className="h-4 w-4" />
                <span>Contact</span>
              </Link>
            )}
            {show.locationLink && (
              <Link href={show.locationLink} target="_blank" className="flex items-center gap-2 hover:text-primary">
                <MapPinIcon className="h-4 w-4" />
                <span>Venue Info</span>
              </Link>
            )}
          </div>

          {show.slogan && (
            <p className="text-xl italic text-muted-foreground">{show.slogan}</p>
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
                img: ({src, alt}) => {
                  if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
                    return (
                      <div className="relative w-full h-[400px] my-2">
                        <Image 
                          src={src} 
                          alt={alt || 'Show image'} 
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    );
                  }
                  return (
                    <div className="relative w-full h-[400px] my-2">
                      <Image 
                        src={src || ''} 
                        alt={alt || 'Show image'} 
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  );
                }
              }}
            >
              {show.description}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}