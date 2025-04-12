"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, ControllerRenderProps, FieldError } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2, Save, Trash2 } from "lucide-react"
import { format, setDate, isValid, parse } from "date-fns"
import Image from "next/image"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { languageOptions } from "@/lib/language-options"
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
import { createFestivalAction, deleteFestivalAction, updateFestivalAction } from "@/actions/festivals-actions"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"
import { uploadImageAction } from "@/actions/upload-actions"
import { SelectFestival } from "@/db/schema/festivals-schema"
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
    name: z.string().min(2, { message: "Festival name must be at least 2 characters." }),
    country: z.string().min(2, { message: "Country must be at least 2 characters." }),
    city: z.string().min(2, { message: "City must be at least 2 characters." }),
    dateStart: z.date().optional(),
    dateEnd: z.date().optional(),
    website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
    instagram: z.string()
      .regex(/^[a-zA-Z0-9._]{1,30}$/, { message: "Invalid Instagram handle format" })
      .optional()
      .or(z.literal("")),
    poster: z.any().optional(),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    slogan: z.string().optional(),
    languages: z.array(z.string()).min(1, { message: "Select at least one language." }),
    accommodationOffered: z.boolean().default(false),
    mixerShows: z.boolean().default(false),
  })
  .refine((data) => data.dateStart, {
    message: "Start date is required.",
    path: ["dateStart"],
  })
  .refine((data) => data.dateEnd, {
    message: "End date is required.",
    path: ["dateEnd"],
  })
  .refine((data) => !data.dateStart || !data.dateEnd || data.dateEnd >= data.dateStart, {
    message: "End date must be after or equal to start date",
    path: ["dateEnd"],
  })

interface FestivalFormProps {
  festival?: SelectFestival
}

export function FestivalForm({ festival }: FestivalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(festival?.poster || null)
  const [formError, setFormError] = useState<string | null>(null)
  const { userId } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: festival?.name || "",
      country: festival?.country || "",
      city: festival?.city || "",
      dateStart: festival?.dateStart ? parse(festival.dateStart, 'yyyy-MM-dd', new Date()) : undefined,
      dateEnd: festival?.dateEnd ? parse(festival.dateEnd, 'yyyy-MM-dd', new Date()) : undefined,
      website: festival?.website || "",
      instagram: festival?.instagram || "",
      description: festival?.description || "",
      slogan: festival?.slogan || "",
      languages: festival?.languages || [],
      accommodationOffered: festival?.accommodationOffered || false,
      mixerShows: festival?.mixerShows || false,
    },
  })

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const { poster, dateStart, dateEnd, ...festivalData } = values
      let posterUrl: string | undefined = festival?.poster || undefined

      if (poster && poster instanceof File) {
        setIsUploading(true)
        
        const formData = new FormData()
        formData.append('file', poster)
        formData.append('directory', 'festival-posters')
        
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

      const formattedFestivalData = {
        ...festivalData,
        poster: posterUrl,
        dateStart: dateStart ? format(dateStart, 'yyyy-MM-dd') : undefined,
        dateEnd: dateEnd ? format(dateEnd, 'yyyy-MM-dd') : undefined,
      };

      if (festival) {
        // Update existing festival
        const result = await updateFestivalAction(festival.id, formattedFestivalData)

        if (result.status === "success") {
          toast.success("Festival updated successfully!")
          router.push("/festivals/" + festival.id)
        } else {
          toast.error(result.message)
        }
      } else {
        // Create new festival
        const result = await createFestivalAction({
          ...formattedFestivalData,
          userId: userId || "",
        })

        if (result.status === "success") {
          toast.success("Festival created successfully!")
          router.push("/festivals/" + result.data.id)
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      console.error("Error saving festival information:", error)
      toast.error("Failed to save festival information. Please try again.")
      setFormError(`Failed to save festival information. Please try again. ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!festival) return
    
    setIsSubmitting(true)

    try {
      const result = await deleteFestivalAction(festival.id)

      if (result.status === "success") {
        toast.success("Festival deleted successfully!")
        router.push("/")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error deleting festival:", error)
      toast.error("Failed to delete festival. Please try again.")
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
        // Optionally clear the preview if needed
        // setPosterPreview(null);
        // form.setValue("poster", undefined);
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Festival Information</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Validation errors:", errors)
          setFormError("Please fix the validation errors above before submitting.")
        })}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Festival Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter festival name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country*</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="dateStart"
              render={({ field }) => {
                const startDate = form.watch("dateStart")
                const endDate = form.watch("dateEnd")
                const selectedRange: DateRange | undefined =
                  startDate && endDate
                    ? { from: startDate, to: endDate }
                    : startDate
                      ? { from: startDate, to: undefined }
                      : undefined

                const startError = form.getFieldState("dateStart").error
                const endError = form.getFieldState("dateEnd").error
                const errorMessage = endError?.message || startError?.message

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Festival Dates*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground",
                              errorMessage && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? (
                              endDate ? (
                                startDate instanceof Date && isValid(startDate) && endDate instanceof Date && isValid(endDate) ? (
                                  `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`
                                ) : (
                                  <span>Pick dates</span>
                                )
                              ) : (
                                startDate instanceof Date && isValid(startDate) ? (
                                  format(startDate, "PPP")
                                ) : (
                                  <span>Pick dates</span>
                                )
                              )
                            ) : (
                              <span>Pick dates</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={startDate}
                          selected={selectedRange}
                          numberOfMonths={1}
                          onSelect={(range) => {
                            form.setValue("dateStart", range?.from, { shouldValidate: true })
                            form.setValue("dateEnd", range?.to, { shouldValidate: true })
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage>{errorMessage}</FormMessage>
                  </FormItem>
                )
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourfestival.com" {...field} />
                    </FormControl>
                    <FormDescription>Include the full URL with http:// or https://</FormDescription>
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
                    <FormDescription>Enter your Instagram handle without the @ symbol</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Poster</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <Input type="file" accept="image/*" onChange={handlePosterChange} className="cursor-pointer" />
                  <FormDescription>Upload a poster image for your festival (JPG, PNG, etc.)</FormDescription>
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
                      placeholder="Describe your festival... (Markdown supported)"
                      className="min-h-[250px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slogan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slogan</FormLabel>
                  <FormControl>
                    <Input placeholder="Festival slogan or tagline" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages*</FormLabel>
                  <Select
                    onValueChange={(value: string) => {
                      const currentValues = field.value || []
                      if (!currentValues.includes(value)) {
                        field.onChange([...currentValues, value])
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select languages" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languageOptions.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name} ({language.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((lang) => {
                      const language = languageOptions.find((l) => l.code === lang)
                      return (
                        <div
                          key={lang}
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {language?.name || lang}
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value.filter((l) => l !== lang))
                            }}
                            className="text-secondary-foreground/70 hover:text-secondary-foreground"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="accommodationOffered"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Accommodation Offered</FormLabel>
                      <FormDescription>Does your festival offer accommodation for participants?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mixerShows"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mixer Shows</FormLabel>
                      <FormDescription>Does your festival include mixer shows? Mixer shows are shows where participants of workshops can showcase their work.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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
                        Delete Festival
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the festival and all associated data.
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
                    Save Festival
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

