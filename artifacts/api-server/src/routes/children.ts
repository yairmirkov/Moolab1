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
    grade: childrenTable.grade,
    skillLevel: childrenTable.skillLevel,
    gradeUpdatedAt: childrenTable.gradeUpdatedAt,
    xp: childrenTable.xp,
    level: childrenTable.level,
    streak: childrenTable.streak,
    bossWins: childrenTable.bossWins,
    moolies: childrenTable.moolies,
    lessonsCompleted: childrenTable.lessonsCompleted,
    lastActiveAt: childrenTable.lastActiveAt,
    createdAt: childrenTable.createdAt,
  }).from(childrenTable).where(eq(childrenTable.parentId, parentId));

  return res.json(children);
});

const VALID_SKILL_LEVELS = ["beginner", "intermediate", "expert"];
const VALID_GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "college", "adult"];

router.post("/children", async (req, res) => {
  const parentId = (req.session as any)?.parentId;
  if (!parentId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { displayName, ageGroup, grade, skillLevel } = req.body;
    if (!displayName || !ageGroup) {
      return res.status(400).json({ error: "Display name and age group are required" });
    }
    if (!["8-12", "13-15", "16-18"].includes(ageGroup)) {
      return res.status(400).json({ error: "Invalid age group. Must be 8-12, 13-15, or 16-18" });
    }
    const finalGrade: string | null = grade && VALID_GRADES.includes(grade) ? grade : null;
    const finalSkill = skillLevel && VALID_SKILL_LEVELS.includes(skillLevel) ? skillLevel : "beginner";

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
      grade: finalGrade,
      skillLevel: finalSkill,
      gradeUpdatedAt: finalGrade ? new Date() : null,
      moolies: 50,
    }).returning();

    return res.json({
      id: child.id,
      username: child.username,
      displayName: child.displayName,
      pin: child.pin,
      ageGroup: child.ageGroup,
      grade: child.grade,
      skillLevel: child.skillLevel,
      gradeUpdatedAt: child.gradeUpdatedAt,
      xp: child.xp,
      level: child.level,
      streak: child.streak,
      bossWins: child.bossWins,
      moolies: child.moolies,
      lessonsCompleted: child.lessonsCompleted,
    });
  } catch (err: any) {
    console.error("Create child error:", err);
    return res.status(500).json({ error: "Failed to create child profile" });
  }
});

router.put("/children/:id/grade", async (req, res) => {
  const parentId = (req.session as any)?.parentId;
  if (!parentId) return res.status(401).json({ error: "Not authenticated" });
  const childId = parseInt(req.params.id);
  const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, childId));
  if (!child || child.parentId !== parentId) return res.status(404).json({ error: "Child not found" });
  const { grade, skillLevel } = req.body || {};
  const updates: any = { gradeUpdatedAt: new Date() };
  if (grade && VALID_GRADES.includes(grade)) updates.grade = grade;
  if (skillLevel && VALID_SKILL_LEVELS.includes(skillLevel)) updates.skillLevel = skillLevel;
  await db.update(childrenTable).set(updates).where(eq(childrenTable.id, childId));
  return res.json({ ok: true });
});

router.put("/children/me/progress", async (req, res) => {
  const childId = (req.session as any)?.childId;
  if (!childId) {
    return res.status(401).json({ error: "Not authenticated as child" });
  }
  try {
    const { xp, level, streak, bossWins, moolies, lessonsCompleted } = req.body || {};
    const updates: any = { lastActiveAt: new Date() };
    if (typeof xp === "number") updates.xp = Math.max(0, Math.floor(xp));
    if (typeof level === "number") updates.level = Math.max(1, Math.floor(level));
    if (typeof streak === "number") updates.streak = Math.max(0, Math.floor(streak));
    if (typeof bossWins === "number") updates.bossWins = Math.max(0, Math.floor(bossWins));
    if (typeof moolies === "number") updates.moolies = Math.max(0, Math.floor(moolies));
    if (typeof lessonsCompleted === "number") updates.lessonsCompleted = Math.max(0, Math.floor(lessonsCompleted));

    await db.update(childrenTable).set(updates).where(eq(childrenTable.id, childId));
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Update progress error:", err);
    return res.status(500).json({ error: "Failed to update progress" });
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
