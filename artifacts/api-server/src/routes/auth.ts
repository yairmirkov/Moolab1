import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { parentsTable, childrenTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function gradeFromAgeGroup(bucket: string | null | undefined): string {
  if (bucket === "8-12") return "3";
  if (bucket === "13-15") return "8";
  if (bucket === "16-18") return "11";
  return "8";
}

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await db.select().from(parentsTable).where(eq(parentsTable.email, email.toLowerCase().trim()));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [parent] = await db.insert(parentsTable).values({
      email: email.toLowerCase().trim(),
      passwordHash,
    }).returning();

    (req.session as any).parentId = parent.id;

    return res.json({ id: parent.id, email: parent.email, subscriptionStatus: parent.subscriptionStatus });
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [parent] = await db.select().from(parentsTable).where(eq(parentsTable.email, email.toLowerCase().trim()));
    if (!parent) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, parent.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    (req.session as any).parentId = parent.id;

    return res.json({ id: parent.id, email: parent.email, subscriptionStatus: parent.subscriptionStatus });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/child-login", async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) {
      return res.status(400).json({ error: "Username and PIN are required" });
    }

    const [child] = await db.select().from(childrenTable)
      .where(eq(childrenTable.username, username.toLowerCase().trim()));
    if (!child || child.pin !== pin) {
      return res.status(401).json({ error: "Invalid username or PIN" });
    }

    (req.session as any).childId = child.id;
    (req.session as any).ageGroup = child.ageGroup;

    let grade: string | null = (child as any).grade ?? null;
    let skillLevel: string | null = (child as any).skillLevel ?? null;
    let gradeUpdatedAt: Date | null = (child as any).gradeUpdatedAt ?? null;
    if (!grade) {
      grade = gradeFromAgeGroup(child.ageGroup);
      skillLevel = skillLevel || "beginner";
      gradeUpdatedAt = new Date();
      try {
        await db.update(childrenTable)
          .set({ grade, skillLevel, gradeUpdatedAt })
          .where(eq(childrenTable.id, child.id));
      } catch (e) {
        console.warn("Lazy grade migration failed for child", child.id, e);
      }
    }

    return res.json({
      id: child.id,
      username: child.username,
      displayName: child.displayName,
      ageGroup: child.ageGroup,
      grade,
      skillLevel,
      gradeUpdatedAt,
      xp: child.xp,
      level: child.level,
      streak: child.streak,
      bossWins: child.bossWins,
      moolies: child.moolies,
      lessonsCompleted: child.lessonsCompleted,
    });
  } catch (err: any) {
    console.error("Child login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", async (req, res) => {
  const parentId = (req.session as any)?.parentId;
  if (!parentId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const [parent] = await db.select().from(parentsTable).where(eq(parentsTable.id, parentId));
  if (!parent) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({ id: parent.id, email: parent.email, subscriptionStatus: parent.subscriptionStatus });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
