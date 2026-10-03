import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertReconFinding, InsertReconScan, InsertUser, ReconScan, reconFindings, reconScans, users } from "../drizzle/schema";
import type { ReconFinding as SharedReconFinding } from "@shared/recon";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

function requireDb() {
  return getDb().then(db => {
    if (!db) throw new Error("Database is not available for Recon persistence.");
    return db;
  });
}

export async function createReconScan(input: Omit<InsertReconScan, "id">) {
  const db = await requireDb();
  const result = await db.insert(reconScans).values(input);
  return Number(result[0].insertId);
}

export async function updateReconScan(id: number, values: Partial<InsertReconScan>) {
  const db = await requireDb();
  await db.update(reconScans).set(values).where(eq(reconScans.id, id));
}

export async function createReconFindings(findings: InsertReconFinding[]) {
  if (!findings.length) return;
  const db = await requireDb();
  await db.insert(reconFindings).values(findings);
}

export async function getReconScanById(id: number, ownerId: number): Promise<ReconScan | undefined> {
  const db = await requireDb();
  const result = await db.select().from(reconScans).where(eq(reconScans.id, id)).limit(1);
  const scan = result[0];
  return scan && scan.ownerId === ownerId ? scan : undefined;
}

export async function listReconScans(ownerId: number, limit = 30) {
  const db = await requireDb();
  return db.select().from(reconScans).where(eq(reconScans.ownerId, ownerId)).orderBy(desc(reconScans.createdAt)).limit(limit);
}

export async function listReconFindings(scanId: number) {
  const db = await requireDb();
  return db.select().from(reconFindings).where(eq(reconFindings.scanId, scanId)).orderBy(desc(reconFindings.createdAt));
}

export function serializeReconFinding(finding: SharedReconFinding, scanId: number): InsertReconFinding {
  return {
    scanId,
    type: finding.type,
    asset: finding.asset,
    source: finding.source,
    severity: finding.severity,
    ip: finding.ip,
    url: finding.url,
    statusCode: finding.statusCode,
    title: finding.title,
    technologies: finding.technologies?.join(", "),
    records: finding.records?.join(", "),
    evidence: finding.evidence,
  };
}
