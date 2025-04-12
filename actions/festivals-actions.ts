"use server";

import { createFestival, deleteFestival, getFestivalById, getFestivalsByUserId, getAllFestivals, getUpcomingFestivals, updateFestival, getPastFestivals } from "@/db/queries/festivals-queries";
import { InsertFestival } from "@/db/schema/festivals-schema";
import { ActionState } from "@/types";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// Helper to clean data for DB insertion/update (remove undefined/nulls where appropriate)
// Useful because Partial<InsertFestival> might still receive nulls from the form
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

// createFestivalAction now expects data conforming to InsertFestival
// Note: The caller (form) is responsible for ensuring userId and required fields are present
export async function createFestivalAction(festivalData: InsertFestival): Promise<ActionState> {
  try {
    // Data comes pre-formatted, just clean it
    const dataToInsert = cleanDataForDb(festivalData) as InsertFestival;

    // Add a check for required fields that might be missed if type assertion is too broad
    if (!dataToInsert.name || !dataToInsert.country || !dataToInsert.city || !dataToInsert.description || !dataToInsert.userId) {
       return { status: "error", message: "Missing required festival information for creation." };
    }
    
    const newFestival = await createFestival(dataToInsert);
    revalidatePath("/festivals");
    revalidatePath("/");
    revalidatePath("/list");
    return { status: "success", message: "Festival created successfully", data: newFestival };
  } catch (error) {
    console.error("Error creating festival:", error);
    const message = error instanceof Error ? error.message : "Failed to create festival";
    return { status: "error", message: message };
  }
}

export async function getFestivalsByUserIdAction(userId: string): Promise<ActionState> {
  try {
    const festivals = await getFestivalsByUserId(userId);
    return { status: "success", message: "Festivals retrieved successfully", data: festivals };
  } catch (error) {
    console.error("Error getting festivals:", error);
    return { status: "error", message: "Failed to get festivals" };
  }
}

export async function getFestivalByIdAction(id: string): Promise<ActionState> {
  try {
    const festival = await getFestivalById(id);
    return { status: "success", message: "Festival retrieved successfully", data: festival };
  } catch (error) {
    console.error("Error getting festival by ID:", error);
    return { status: "error", message: "Failed to get festival" };
  }
}

// updateFestivalAction expects Partial<InsertFestival>
export async function updateFestivalAction(id: string, festivalData: Partial<InsertFestival>): Promise<ActionState> {
  try {
    // Clean the partial data
    let dataToUpdate: Partial<InsertFestival> = cleanDataForDb(festivalData);

    // Add/overwrite updatedAt
    dataToUpdate.updatedAt = new Date();

    // Remove id from dataToUpdate if it exists, as it's passed separately
    // The id field should not be part of the set clause in an update
    delete dataToUpdate.id;

    const updatedFestival = await updateFestival(id, dataToUpdate);

    if (!updatedFestival) {
      return { status: "error", message: "Festival not found or update failed" };
    }

    revalidatePath("/festivals");
    revalidatePath("/");
    revalidatePath("/list");
    revalidatePath(`/festivals/${id}`);
    return { status: "success", message: "Festival updated successfully", data: updatedFestival };
  } catch (error) {
    console.error("Error updating festival:", error);
    const message = error instanceof Error ? error.message : "Failed to update festival";
    return { status: "error", message: message };
  }
}

export async function deleteFestivalAction(id: string): Promise<ActionState> {
  try {
    await deleteFestival(id);
    revalidatePath("/festivals");
    revalidatePath("/");
    revalidatePath("/list");
    return { status: "success", message: "Festival deleted successfully" };
  } catch (error) {
    console.error("Error deleting festival:", error);
    return { status: "error", message: "Failed to delete festival" };
  }
}

export async function getAllFestivalsAction(): Promise<ActionState> {
  try {
    const festivals = await getAllFestivals();
    return { status: "success", message: "All festivals retrieved successfully", data: festivals };
  } catch (error) {
    console.error("Error getting all festivals:", error);
    return { status: "error", message: "Failed to get all festivals" };
  }
}

export async function getUpcomingFestivalsAction(startDate: Date): Promise<ActionState> {
  try {
    const festivals = await getUpcomingFestivals(startDate);
    return { status: "success", message: "Upcoming festivals retrieved successfully", data: festivals };
  } catch (error) {
    console.error("Error getting upcoming festivals:", error);
    return { status: "error", message: "Failed to get upcoming festivals" };
  }
}

export async function getPastFestivalsAction(startDate: Date, limit: number): Promise<ActionState> {
  try {
    const festivals = await getPastFestivals(startDate, limit);
    return { status: "success", message: "Past festivals retrieved successfully", data: festivals };
  } catch (error) {
    console.error("Error getting past festivals:", error);
    return { status: "error", message: "Failed to get past festivals" };
  }
}

export async function canEditAction(festivalUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    return false; // Not logged in, cannot edit
  }
  // Allow editing if the user owns the festival OR if the user is the admin
  return festivalUserId === userId || userId === process.env.ADMIN_USER;
} 