"use server";

import { createFestival, deleteFestival, getFestivalById, getFestivalsByUserId, getAllFestivals, getUpcomingFestivals, updateFestival, getPastFestivals } from "@/db/queries/festivals-queries";
import { InsertFestival } from "@/db/schema/festivals-schema";
import { ActionState } from "@/types";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createFestivalAction(festival: InsertFestival): Promise<ActionState> {
  try {
    const newFestival = await createFestival(festival);
    revalidatePath("/festivals");
    return { status: "success", message: "Festival created successfully", data: newFestival };
  } catch (error) {
    console.error("Error creating festival:", error);
    return { status: "error", message: "Failed to create festival" };
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

export async function updateFestivalAction(id: string, data: Partial<InsertFestival>): Promise<ActionState> {
  try {
    const updatedFestival = await updateFestival(id, data);
    revalidatePath("/festivals");
    return { status: "success", message: "Festival updated successfully", data: updatedFestival };
  } catch (error) {
    console.error("Error updating festival:", error);
    return { status: "error", message: "Failed to update festival" };
  }
}

export async function deleteFestivalAction(id: string): Promise<ActionState> {
  try {
    await deleteFestival(id);
    revalidatePath("/festivals");
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