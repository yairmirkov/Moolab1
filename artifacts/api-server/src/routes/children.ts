import { Router } from "express";
import { db } from "@workspace/db";
import { childrenTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function generateUsername(displayName: string): string {
  const base = displayName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "user";
  const suffix = Math.floor(10 + Math.random() * 90);
  return (base + suffix).toLowerCase();
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

router.get("/children", async (req, res) => {
  const parentId = (req.session as any)?.parentId;
  if (!parentId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const children = await db.select({
    id: childrenTable.id,
    username: childrenTable.username,
    displayName: childrenTable.displayName,
    pin: childrenTable.pin,
    ageGroup: childrenTable.ageGroup,
    createdAt: childrenTable.createdAt,
  }).from(childrenTable).where(eq(childrenTable.parentId, parentId));

  return res.json(children);
});

router.post("/children", async (req, res) => {
  const parentId = (req.session as any)?.parentId;
  if (!parentId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { displayName, ageGroup } = req.body;
    if (!displayName || !ageGroup) {
      return res.status(400).json({ error: "Display name and age group are required" });
    }
    if (!["8-12", "13-15", "16-18"].includes(ageGroup)) {
      return res.status(400).json({ error: "Invalid age group. Must be 8-12, 13-15, or 16-18" });
    }

    let username = generateUsername(displayName);
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db.select().from(childrenTable).where(eq(childrenTable.username, username));
      if (existing.length === 0) break;
      username = generateUsername(displayName);
      attempts++;
    }

    const pin = generatePin();

    const [child] = await db.insert(childrenTable).values({
      parentId,
      username,
      pin,
      displayName,
      ageGroup,
    }).returning();

    return res.json({
      id: child.id,
      username: child.username,
      displayName: child.displayName,
      pin: child.pin,
      ageGroup: child.ageGroup,
    });
  } catch (err: any) {
    console.error("Create child error:", err);
    return res.status(500).json({ error: "Failed to create child profile" });
  }
});

router.delete("/children/:id", async (req, res) => {
  const parentId = (req.session as any)?.parentId;
  if (!parentId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const childId = parseInt(req.params.id);
  const [child] = await db.select().from(childrenTable)
    .where(eq(childrenTable.id, childId));

  if (!child || child.parentId !== parentId) {
    return res.status(404).json({ error: "Child not found" });
  }

  await db.delete(childrenTable).where(eq(childrenTable.id, childId));
  return res.json({ ok: true });
});

export default router;
