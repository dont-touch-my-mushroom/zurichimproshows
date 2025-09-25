import { boolean, pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";

export const showsTable = pgTable("shows", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  name: text("name").notNull(),
  showStarts: timestamp("show_starts").notNull(),
  doorsOpen: timestamp("doors_open"),
  website: text("website"),
  instagram: text("instagram"),
  poster: text("poster"),
  description: text("description"),
  slogan: text("slogan"),
  email: text("email"),
  groups: text("groups").array(),
  ticketsLink: text("tickets_link"),
  locationName: text("location_name"),
  locationLink: text("location_link"),
  ticketPrice: text("ticket_price"),
});

export type InsertShow = typeof showsTable.$inferInsert;
export type SelectShow = typeof showsTable.$inferSelect;