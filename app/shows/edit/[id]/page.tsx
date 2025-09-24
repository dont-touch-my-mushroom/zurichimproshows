import { notFound, redirect } from "next/navigation"
import { getShowByIdAction, canEditAction } from "@/actions/shows-actions"
import { ShowForm } from "@/components/form/show-form"
import { auth } from "@clerk/nextjs/server"

interface EditShowPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditShowPage({ params }: EditShowPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/")
  }

  const { id } = await params
  const result = await getShowByIdAction(id)
  
  if (result.status !== "success" || !result.data) {
    notFound()
  }

  const show = result.data

  // Check if the authenticated user owns this show
  const canEdit = await canEditAction(show.userId)
  if (!canEdit) {
    redirect("/list")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Show</h1>
      <ShowForm show={show} />
    </div>
  )
} 