import { int, index, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const reconScans = mysqlTable("recon_scans", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  target: varchar("target", { length: 253 }).notNull(),
  mode: mysqlEnum("mode", ["passive", "active"]).notNull(),
  status: mysqlEnum("status", ["queued", "running", "completed", "failed"]).default("queued").notNull(),
  findingsCount: int("findingsCount").default(0).notNull(),
  reportMarkdown: text("reportMarkdown"),
  warnings: text("warnings"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  ownerCreatedIdx: index("recon_scans_owner_created_idx").on(table.ownerId, table.createdAt),
}));

export const reconFindings = mysqlTable("recon_findings", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  type: mysqlEnum("type", ["subdomain", "dns", "http"]).notNull(),
  asset: varchar("asset", { length: 253 }).notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  severity: mysqlEnum("severity", ["info", "low", "medium", "high"]).default("info").notNull(),
  ip: varchar("ip", { length: 64 }),
  url: varchar("url", { length: 2048 }),
  statusCode: int("statusCode"),
  title: varchar("title", { length: 512 }),
  technologies: text("technologies"),
  records: text("records"),
  evidence: text("evidence"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  scanAssetIdx: index("recon_findings_scan_asset_idx").on(table.scanId, table.asset),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ReconScan = typeof reconScans.$inferSelect;
export type InsertReconScan = typeof reconScans.$inferInsert;
export type ReconFinding = typeof reconFindings.$inferSelect;
export type InsertReconFinding = typeof reconFindings.$inferInsert;
