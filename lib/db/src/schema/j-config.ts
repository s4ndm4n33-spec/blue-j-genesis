import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const jConfig = pgTable("j_config", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  configKey: text("config_key").notNull().unique(),
  configValue: text("config_value").notNull(),
  description: text("description"),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type JConfigRow = typeof jConfig.$inferSelect;
