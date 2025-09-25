"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Save, Trash2, MapPinIcon, TicketIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createShowAction, deleteShowAction, updateShowAction } from "@/actions/shows-actions"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"
import { uploadImageAction } from "@/actions/upload-actions"
import { SelectShow } from "@/db/schema/shows-schema"
import { MarkdownEditor } from "@/components/ui/markdown-editor"

const helpText = `# Heading 1
## Heading 2
### Heading 3

**Bold text** or __bold text__
*Italic text* or _italic text_

- Bullet list item
- Another item
  - Nested item

1. Numbered list
2. Second item

[Link text](https://example.com)

> Blockquote text

\`inline code\`

\`\`\`
// Code block
function example() {
  return "Hello world";
}
\`\`\`

---
Horizontal rule above
`;

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Show name must be at least 2 characters." }),
    showStarts: z.date({ required_error: "Show start time is required." }),
    doorsOpen: z.date({ required_error: "Doors open time is required." }),
    website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
    instagram: z.string()
      .regex(/^[a-zA-Z0-9._]{1,30}$/, { message: "Invalid Instagram handle format" })
      .optional()
      .or(z.literal("")),
    poster: z.any().optional(),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    slogan: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal("")),
    groups: z.array(z.string()).min(1, { message: "At least one performing group is required." }),
    ticketsLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
    locationName: z.string().optional(),
    locationLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
    ticketPrice: z.string().optional(),
  })
  .refine((data) => !data.showStarts || !data.doorsOpen || data.showStarts >= data.doorsOpen, {
    message: "Show start time must be after or equal to doors open time",
    path: ["showStarts"],
  })

interface ShowFormProps {
  show?: SelectShow
}

export function ShowForm({ show }: ShowFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(show?.poster || null)
  const [formError, setFormError] = useState<string | null>(null)
  const { userId } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: show?.name || "",
      showStarts: show?.showStarts ? new Date(show.showStarts) : undefined,
      doorsOpen: show?.doorsOpen ? new Date(show.doorsOpen) : undefined,
      website: show?.website || "",
      instagram: show?.instagram || "",
      description: show?.description || "",
      slogan: show?.slogan || "",
      email: show?.email || "",
      groups: show?.groups && show.groups.length > 0 ? show.groups : [""],
      ticketsLink: show?.ticketsLink || "",
      locationName: show?.locationName || "",
      locationLink: show?.locationLink || "",
      ticketPrice: show?.ticketPrice || "",
    },
  })

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const { poster, showStarts, doorsOpen, groups, ...showData } = values
      let posterUrl: string | undefined = show?.poster || undefined

      if (poster && poster instanceof File) {
        setIsUploading(true)
        
        const formData = new FormData()
        formData.append('file', poster)
        formData.append('directory', 'show-posters')
        
        const uploadResult = await uploadImageAction(formData)
        setIsUploading(false)
        
        if (uploadResult.status === 'success' && uploadResult.url) {
          posterUrl = uploadResult.url
        } else {
          toast.error(uploadResult.message || 'Failed to upload poster image')
          setFormError(uploadResult.message || 'Failed to upload poster image')
          setIsSubmitting(false)
          return
        }
      }

      const formattedShowData = {
        ...showData,
        poster: posterUrl,
        showStarts: showStarts,
        doorsOpen: doorsOpen,
        groups: groups || [],
      };

      if (show) {
        // Update existing show
        const result = await updateShowAction(show.id, formattedShowData)

        if (result.status === "success") {
          toast.success("Show updated successfully!")
          router.push("/shows/" + show.id)
        } else {
          toast.error(result.message)
        }
      } else {
        // Create new show
        const result = await createShowAction({
          ...formattedShowData,
          userId: userId || "",
        })

        if (result.status === "success") {
          toast.success("Show created successfully!")
          router.push("/shows/" + result.data.id)
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      console.error("Error saving show information:", error)
      toast.error("Failed to save show information. Please try again.")
      setFormError(`Failed to save show information. Please try again. ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!show) return
    
    setIsSubmitting(true)

    try {
      const result = await deleteShowAction(show.id)

      if (result.status === "success") {
        toast.success("Show deleted successfully!")
        router.push("/")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error deleting show:", error)
      toast.error("Failed to delete show. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate that the file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        e.target.value = ''; // Reset the input
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File is too large. Maximum size is 3MB.");
        e.target.value = ''; // Reset the input
        return;
      }
      
      form.setValue("poster", file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPosterPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addGroup = () => {
    const currentGroups = form.getValues("groups") || []
    form.setValue("groups", [...currentGroups, ""])
  }

  const removeGroup = (index: number) => {
    const currentGroups = form.getValues("groups") || []
    if (currentGroups.length > 1) {
      form.setValue("groups", currentGroups.filter((_, i) => i !== index))
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Show Information</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Validation errors:", errors)
          setFormError("Please fix the validation errors above before submitting.")
        })}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Show Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter show name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Performing Groups */}
            <FormField
              control={form.control}
              name="groups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performing Groups*</FormLabel>
                  <div className="space-y-2">
                    {(field.value || []).map((group, index) => (
                      <div key={index} className="flex gap-2">
                        <FormControl>
                          <div className="relative">
                            <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Group name" 
                              className="pl-10"
                              value={group}
                              onChange={(e) => {
                                const newGroups = [...(field.value || [])]
                                newGroups[index] = e.target.value
                                field.onChange(newGroups)
                              }}
                            />
                          </div>
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeGroup(index)}
                          disabled={(field.value || []).length <= 1}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addGroup}
                      className="w-full"
                    >
                      + Add Group
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="doorsOpen"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Doors Open*</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                          // Auto-fill show starts if it's empty and doors open is filled
                          const currentShowStarts = form.getValues("showStarts")
                          if (value && !currentShowStarts) {
                            // Add 30 minutes to doors open time for show starts
                            const showStartsTime = new Date(value.getTime() + 30 * 60 * 1000)
                            form.setValue("showStarts", showStartsTime)
                          }
                        }}
                        placeholder="Pick doors open time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showStarts"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Show Starts*</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Pick show start time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Venue name" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Link (e.g. goolgle maps)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://venue-website.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ticket Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ticketsLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tickets Link</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <TicketIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://tickets.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ticketPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Price</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20.- / 15.- students" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourshow.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                        <Input 
                          placeholder="myInstagramUser" 
                          className="pl-8"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value.replace(/^@/, ""))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@yourshow.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Poster */}
            <FormItem>
              <FormLabel>Poster</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <Input type="file" accept="image/*" onChange={handlePosterChange} className="cursor-pointer" />
                  <FormDescription>Upload a poster image for your show (JPG, PNG, etc.)</FormDescription>
                </div>

                {posterPreview && (
                  <Card className="w-full max-w-[300px] h-[200px] relative overflow-hidden">
                    <Image
                      src={posterPreview || ""}
                      alt="Poster preview"
                      className="object-contain"
                      fill
                      sizes="300px"
                      style={{ objectFit: "contain" }}
                    />
                  </Card>
                )}
              </div>
            </FormItem>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormDescription>You can use Markdown to format your description.</FormDescription>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <details>
                      <summary className="cursor-pointer hover:text-foreground">Markdown Help</summary>
                      <pre className="p-2 mt-1 text-xs bg-muted rounded-md overflow-auto">{helpText}</pre>
                    </details>
                  </div>
                  <FormControl>
                    <MarkdownEditor 
                      value={field.value} 
                      onChange={field.onChange}
                      placeholder="Describe your show... (Markdown supported)"
                      className="min-h-[250px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slogan */}
            <FormField
              control={form.control}
              name="slogan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slogan</FormLabel>
                  <FormControl>
                    <Input placeholder="Show slogan or tagline" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="flex justify-between w-full">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={isSubmitting} className="cursor-pointer">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Show
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the show and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button type="submit" disabled={isSubmitting || isUploading} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading image...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Show
                  </>
                )}
              </Button>
            </div>
            
            {formError && (
              <div className="text-destructive text-sm font-medium w-full text-right">
                {formError}
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}