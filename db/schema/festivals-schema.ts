import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const festivalsTable = pgTable("festivals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  name: text("name").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  dateFrom: timestamp("date_from").notNull(),
  dateUntil: timestamp("date_until").notNull(),
  website: text("website"),
  instagram: text("instagram"),
  poster: text("poster"),
  description: text("description").notNull(),
  slogan: text("slogan"),
  languages: text("languages").array().notNull(),
  accommodationOffered: boolean("accommodation_offered").default(false).notNull(),
  mixerShows: boolean("mixer_shows").default(false).notNull(),
});

export type InsertFestival = typeof festivalsTable.$inferInsert;
export type SelectFestival = typeof festivalsTable.$inferSelect;