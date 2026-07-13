import { Router } from "express";
import { db } from "@workspace/db";
import { parentsTable, childrenTable } from "@workspace/db/schema";

const router = Router();

router.get("/admin/parents", async (req, res) => {
  try {
    const parents = await db.select({
      id: parentsTable.id,
      email: parentsTable.email,
      subscriptionStatus: parentsTable.subscriptionStatus,
    }).from(parentsTable);

    const allChildren = await db.select({
      id: childrenTable.id,
      parentId: childrenTable.parentId,
    }).from(childrenTable);

    const childCounts = allChildren.reduce((acc: Record<number, number>, c) => {
      acc[c.parentId] = (acc[c.parentId] || 0) + 1;
      return acc;
    }, {});

    return res.json(parents.map(p => ({ ...p, childCount: childCounts[p.id] || 0 })));
  } catch (err) {
    console.error("Admin get parents error:", err);
    return res.status(500).json({ error: "Failed to fetch parents" });
  }
});

router.get("/admin/children", async (req, res) => {
  try {
    const children = await db.select({
      id: childrenTable.id,
      username: childrenTable.username,
      displayName: childrenTable.displayName,
      grade: childrenTable.grade,
      skillLevel: childrenTable.skillLevel,
      level: childrenTable.level,
      xp: childrenTable.xp,
      streak: childrenTable.streak,
      lastActiveAt: childrenTable.lastActiveAt,
    }).from(childrenTable);
    return res.json(children);
  } catch (err) {
    console.error("Admin get children error:", err);
    return res.status(500).json({ error: "Failed to fetch children" });
  }
});

router.get("/admin/messages", async (_req, res) => {
  // Contact messages are emailed to admin@moolab.app and not stored in the DB
  return res.json([]);
});

export default router;
