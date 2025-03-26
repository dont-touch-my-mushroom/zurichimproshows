import { eq, gt } from "drizzle-orm";
import { db } from "../db";
import { festivalsTable, type InsertFestival, type SelectFestival } from "../schema/festivals-schema";

export async function createFestival(data: InsertFestival): Promise<SelectFestival> {
  const [festival] = await db.insert(festivalsTable).values(data).returning();
  return festival;
}

export async function getFestivalById(id: string): Promise<SelectFestival | null> {
  const [festival] = await db
    .select()
    .from(festivalsTable)
    .where(eq(festivalsTable.id, id));
  return festival;
}

export async function getFestivalsByUserId(userId: string): Promise<SelectFestival[]> {
  return db
    .select()
    .from(festivalsTable)
    .where(eq(festivalsTable.userId, userId));
}

export async function updateFestival(
  id: string,
  data: Partial<InsertFestival>
): Promise<SelectFestival | null> {
  const [festival] = await db
    .update(festivalsTable)
    .set(data)
    .where(eq(festivalsTable.id, id))
    .returning();
  return festival;
}

export async function deleteFestival(id: string): Promise<SelectFestival | null> {
  const [festival] = await db
    .delete(festivalsTable)
    .where(eq(festivalsTable.id, id))
    .returning();
  return festival;
}

export async function getAllFestivals(): Promise<SelectFestival[]> {
  return db.select().from(festivalsTable);
}

export async function getUpcomingFestivals(startDate: Date): Promise<SelectFestival[]> {
  return db
    .select()
    .from(festivalsTable)
    .where(gt(festivalsTable.dateFrom, startDate))
    .orderBy(festivalsTable.dateFrom);
} 