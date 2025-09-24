import { eq, gt, lte, desc } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "../db";
import { showsTable, type InsertShow, type SelectShow } from "../schema/shows-schema";

export async function createShow(data: InsertShow): Promise<SelectShow> {
  const [show] = await db.insert(showsTable).values(data).returning();
  return show;
}

export async function getShowById(id: string): Promise<SelectShow | null> {
  const [show] = await db
    .select()
    .from(showsTable)
    .where(eq(showsTable.id, id));
  return show;
}

export async function getShowsByUserId(userId: string): Promise<SelectShow[]> {
  return db
    .select()
    .from(showsTable)
    .where(eq(showsTable.userId, userId));
}

export async function updateShow(
  id: string,
  data: Partial<InsertShow>
): Promise<SelectShow | null> {
  const [show] = await db
    .update(showsTable)
    .set(data)
    .where(eq(showsTable.id, id))
    .returning();
  return show;
}

export async function deleteShow(id: string): Promise<SelectShow | null> {
  const [show] = await db
    .delete(showsTable)
    .where(eq(showsTable.id, id))
    .returning();
  return show;
}

export async function getAllShows(): Promise<SelectShow[]> {
  return db.select().from(showsTable)
    .orderBy(desc(showsTable.showStarts));
}

export async function getUpcomingShows(startDate: Date): Promise<SelectShow[]> {
  return db
    .select()
    .from(showsTable)
    .where(gt(showsTable.showStarts, startDate))
    .orderBy(showsTable.showStarts);
}

export async function getPastShows(startDate: Date, limit: number): Promise<SelectShow[]> {
  return db
    .select()
    .from(showsTable)
    .where(lte(showsTable.showStarts, startDate))
    .orderBy(desc(showsTable.showStarts))
    .limit(limit);
} 