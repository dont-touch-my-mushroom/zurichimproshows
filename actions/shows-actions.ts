"use server";

import { createShow, deleteShow, getShowById, getShowsByUserId, getAllShows, getUpcomingShows, updateShow, getPastShows } from "@/db/queries/shows-queries";
import { InsertShow } from "@/db/schema/shows-schema";
import { ActionState } from "@/types";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// Helper to clean data for DB insertion/update (remove undefined/nulls where appropriate)
// Useful because Partial<InsertShow> might still receive nulls from the form
function cleanDataForDb(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key in data) {
    // Keep boolean false values, remove null/undefined
    if (data[key] !== null && data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  }
  return cleaned;
}

// createShowAction now expects data conforming to InsertShow
// Note: The caller (form) is responsible for ensuring userId and required fields are present
export async function createShowAction(showData: InsertShow): Promise<ActionState> {
  try {
    // Data comes pre-formatted, just clean it
    const dataToInsert = cleanDataForDb(showData) as InsertShow;

    // Add a check for required fields that might be missed if type assertion is too broad
    if (!dataToInsert.name || !dataToInsert.description || !dataToInsert.userId) {
       return { status: "error", message: "Missing required show information for creation." };
    }
    
    const newShow = await createShow(dataToInsert);
    revalidatePath("/shows");
    revalidatePath("/");
    revalidatePath("/list");
    return { status: "success", message: "Show created successfully", data: newShow };
  } catch (error) {
    console.error("Error creating show:", error);
    const message = error instanceof Error ? error.message : "Failed to create show";
    return { status: "error", message: message };
  }
}

export async function getShowsByUserIdAction(userId: string): Promise<ActionState> {
  try {
    const shows = await getShowsByUserId(userId);
    return { status: "success", message: "Shows retrieved successfully", data: shows };
  } catch (error) {
    console.error("Error getting shows:", error);
    return { status: "error", message: "Failed to get shows" };
  }
}

export async function getShowByIdAction(id: string): Promise<ActionState> {
  try {
    const show = await getShowById(id);
    return { status: "success", message: "Show retrieved successfully", data: show };
  } catch (error) {
    console.error("Error getting show by ID:", error);
    return { status: "error", message: "Failed to get show" };
  }
}

// updateShowAction expects Partial<InsertShow>
export async function updateShowAction(id: string, showData: Partial<InsertShow>): Promise<ActionState> {
  try {
    // Clean the partial data
    let dataToUpdate: Partial<InsertShow> = cleanDataForDb(showData);

    // Add/overwrite updatedAt
    dataToUpdate.updatedAt = new Date();

    // Remove id from dataToUpdate if it exists, as it's passed separately
    // The id field should not be part of the set clause in an update
    delete dataToUpdate.id;

    const updatedShow = await updateShow(id, dataToUpdate);

    if (!updatedShow) {
      return { status: "error", message: "Show not found or update failed" };
    }

    revalidatePath("/shows");
    revalidatePath("/");
    revalidatePath("/list");
    revalidatePath(`/shows/${id}`);
    return { status: "success", message: "Show updated successfully", data: updatedShow };
  } catch (error) {
    console.error("Error updating show:", error);
    const message = error instanceof Error ? error.message : "Failed to update show";
    return { status: "error", message: message };
  }
}

export async function deleteShowAction(id: string): Promise<ActionState> {
  try {
    await deleteShow(id);
    revalidatePath("/shows");
    revalidatePath("/");
    revalidatePath("/list");
    return { status: "success", message: "Show deleted successfully" };
  } catch (error) {
    console.error("Error deleting show:", error);
    return { status: "error", message: "Failed to delete show" };
  }
}

export async function getAllShowsAction(): Promise<ActionState> {
  try {
    const shows = await getAllShows();
    return { status: "success", message: "All shows retrieved successfully", data: shows };
  } catch (error) {
    console.error("Error getting all shows:", error);
    return { status: "error", message: "Failed to get all shows" };
  }
}

export async function getUpcomingShowsAction(startDate: Date): Promise<ActionState> {
  try {
    const shows = await getUpcomingShows(startDate);
    return { status: "success", message: "Upcoming shows retrieved successfully", data: shows };
  } catch (error) {
    console.error("Error getting upcoming shows:", error);
    return { status: "error", message: "Failed to get upcoming shows" };
  }
}

export async function getPastShowsAction(startDate: Date, limit: number): Promise<ActionState> {
  try {
    const shows = await getPastShows(startDate, limit);
    return { status: "success", message: "Past shows retrieved successfully", data: shows };
  } catch (error) {
    console.error("Error getting past shows:", error);
    return { status: "error", message: "Failed to get past shows" };
  }
}

export async function canEditAction(showUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    return false; // Not logged in, cannot edit
  }
  // Allow editing if the user owns the show OR if the user is the admin
  return showUserId === userId || userId === process.env.ADMIN_USER;
} 