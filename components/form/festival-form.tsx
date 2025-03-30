"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2, Save, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Festival name must be at least 2 characters." }),
    country: z.string().min(2, { message: "Country must be at least 2 characters." }),
    city: z.string().min(2, { message: "City must be at least 2 characters." }),
    dateFrom: z.date({ required_error: "Start date is required." }),
    dateUntil: z.date({ required_error: "End date is required." }),
    website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
    instagram: z.string().optional(),
    poster: z.any().optional(),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    slogan: z.string().optional(),
    languages: z.array(z.string()).min(1, { message: "Select at least one language." }),
    accommodationOffered: z.boolean().default(false),
    mixerShows: z.boolean().default(false),
  })
  .refine((data) => data.dateUntil >= data.dateFrom, {
    message: "End date must be after or equal to start date",
    path: ["dateUntil"],
  })

interface FestivalFormProps {
  festival?: SelectFestival
}

export function FestivalForm({ festival }: FestivalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(festival?.poster || null)
  const { userId } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: festival?.name || "",
      country: festival?.country || "",
      city: festival?.city || "",
      website: festival?.website || "",
      instagram: festival?.instagram || "",
      description: festival?.description || "",
      slogan: festival?.slogan || "",
      languages: festival?.languages || [],
      accommodationOffered: festival?.accommodationOffered || false,
      mixerShows: festival?.mixerShows || false,
      dateFrom: festival?.dateFrom ? new Date(festival.dateFrom) : undefined,
      dateUntil: festival?.dateUntil ? new Date(festival.dateUntil) : undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const { poster, ...festivalData } = values
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
          setIsSubmitting(false)
          return
        }
      }

      if (festival) {
        // Update existing festival
        const result = await updateFestivalAction(festival.id, {
          ...festivalData,
          poster: posterUrl,
        })

        if (result.status === "success") {
          toast.success("Festival updated successfully!")
          router.push("/festivals/" + festival.id)
        } else {
          toast.error(result.message)
        }
      } else {
        // Create new festival
        const result = await createFestivalAction({
          ...festivalData,
          poster: posterUrl,
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
        router.push("/festivals")
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date From*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Until*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <Input placeholder="@festivalhandle" {...field} />
                    </FormControl>
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
                      src={posterPreview}
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
                  <FormControl>
                    <Textarea placeholder="Describe your festival..." className="min-h-[120px]" {...field} />
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
                      <FormDescription>Does your festival include mixer shows?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button" disabled={isSubmitting}>
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

            <Button type="submit" disabled={isSubmitting || isUploading}>
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
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

