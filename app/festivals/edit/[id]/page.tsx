import { notFound, redirect } from "next/navigation"
import { getFestivalByIdAction } from "@/actions/festivals-actions"
import { FestivalForm } from "@/components/form/festival-form"
import { auth } from "@clerk/nextjs/server"

interface EditFestivalPageProps {
  params: {
    id: string
  }
}

export default async function EditFestivalPage({ params }: EditFestivalPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const result = await getFestivalByIdAction(params.id)
  
  if (result.status !== "success" || !result.data) {
    notFound()
  }

  const festival = result.data

  // Check if the authenticated user owns this festival
  if (festival.userId !== userId) {
    redirect("/festivals")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Festival</h1>
      <FestivalForm festival={festival} />
    </div>
  )
} 