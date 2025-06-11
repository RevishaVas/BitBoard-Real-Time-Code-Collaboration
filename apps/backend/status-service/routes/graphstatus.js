
const express = require("express");
const router = express.Router();
const { getSession } = require("../services/neo4j");
const { neo4jQuery } = require("../services/neo4j");


console.log("✅ graphstatus.js loaded");

router.get("/tasks", async (req, res) => {
  console.log("➡️  /api/status/tasks route HIT");
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (t:Task)-[:HAS_STATUS]->(s:Status)
      RETURN t.title AS title, s.name AS status
      `);
    const tasks = result.records.map(r => ({
      title: r.get("title"),
      status: r.get("status"),
    }));
    res.json(tasks);
  } catch (error) {
    console.error("Neo4j error:", error);
    res.status(500).json({ error: "Neo4j query failed" });
  } finally { 
    await session.close();
  }
});



router.get("/graph", async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (n)-[r]->(m)
      RETURN n, r, m
    `);

    const nodes = new Map();
    const links = [];

    result.records.forEach((record) => {
      const n = record.get("n");
      const m = record.get("m");
      const r = record.get("r");

      const sourceId = n.identity.toString();
      const targetId = m.identity.toString();

      nodes.set(sourceId, {
        id: sourceId,
        label: n.labels[0],
        ...n.properties,
      });
      nodes.set(targetId, {
        id: targetId,
        label: m.labels[0],
        ...m.properties,
      });

      links.push({
        source: sourceId,
        target: targetId,
        type: r.type,
      });
    });

    res.json({
      nodes: Array.from(nodes.values()),
      links,
    });
  } catch (error) {
    console.error("Neo4j graph fetch failed:", error);
    res.status(500).json({ error: "Failed to load graph" });
  } finally {
    await session.close();
  }
});


router.get("/totalTasks", async (req, res) => {
  const session = getSession(); // ✅ Add this line
  try {
    const result = await session.run(`MATCH (t:Task) RETURN count(t) AS total`);
    res.json({ total: result.records[0].get("total").toInt() });
  } catch (error) {
    console.error("Error in /totalTasks:", error);
    res.status(500).json({ error: "Failed to get total tasks" });
  } finally {
    await session.close();
  }
});



router.get("/completedTasks", async (req, res) => {
  const session = getSession(); // ✅
  try {
    const result = await session.run(`
      MATCH (t:Task)-[:HAS_STATUS]->(s:Status {name: "Done"})
      RETURN count(t) AS completed
    `);
    res.json({ completed: result.records[0].get("completed").toInt() });
  } catch (error) {
    console.error("Error in /completedTasks:", error);
    res.status(500).json({ error: "Failed to get completed tasks" });
  } finally {
    await session.close();
  }
});



router.get("/overdueTasks", async (req, res) => {
  const session = getSession(); // ✅
  try {
    const result = await session.run(`
       MATCH (t:Task)-[:HAS_STATUS]->(s:Status)
      WHERE t.dueDate IS NOT NULL AND s.name <> "Done"
      WITH t,
        CASE
          WHEN toString(t.dueDate) CONTAINS "-" THEN date(t.dueDate)
          ELSE date(datetime({ epochMillis: toInteger(t.dueDate) }))
        END AS due
      WHERE due < date()
      RETURN count(t) AS overdue
    `);
    res.json({ overdue: result.records[0].get("overdue").toInt() });
  } catch (error) {
    console.error("Error in /overdueTasks:", error);
    res.status(500).json({ error: "Failed to get overdue tasks" });
  } finally {
    await session.close();
  }
});



router.get("/nextMilestone", async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (t:Task)-[:HAS_STATUS]->(s:Status)
      WHERE t.dueDate IS NOT NULL AND s.name <> "Done"
      WITH t,
        CASE
          WHEN toString(t.dueDate) CONTAINS "-" THEN date(t.dueDate)
          ELSE date(datetime({ epochMillis: toInteger(t.dueDate) }))
        END AS due
      RETURN t.title AS title, due AS dueDate
      ORDER BY due ASC
      LIMIT 1
    `);

    const record = result.records[0];
    res.json({
      title: record?.get("title") || "None",
      dueDate: record?.get("dueDate")?.toString() || "N/A"
    });
  } catch (error) {
    console.error("Error in /nextMilestone:", error);
    res.status(500).json({ error: "Failed to get milestone" });
  } finally {
    await session.close();
  }
});


router.get("/currentMilestone", async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (t:Task)-[:HAS_STATUS]->(s:Status)
      WHERE t.dueDate IS NOT NULL AND s.name = "In Progress"
      WITH t,
        CASE
          WHEN toString(t.dueDate) CONTAINS "-" THEN date(t.dueDate)
          ELSE date(datetime({ epochMillis: toInteger(t.dueDate) }))
        END AS due
      RETURN t.title AS title, due AS dueDate
      ORDER BY due ASC
      LIMIT 1
    `);

    const record = result.records[0];
    res.json({
      title: record?.get("title") || "None",
      dueDate: record?.get("dueDate")?.toString() || "N/A"
    });
  } catch (error) {
    console.error("Error in /currentMilestone:", error);
    res.status(500).json({ error: "Failed to get current milestone" });
  } finally {
    await session.close();
  }
});




router.get("/tasksByDate", async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (t:Task)
      WHERE t.createdAt IS NOT NULL
      RETURN toString(date(datetime({epochMillis: t.createdAt}))) AS date, count(t) AS count
      ORDER BY date
    `);
    const data = result.records.map(r => ({
      date: r.get("date"),
      count: r.get("count").toInt()
    }));
    res.json(data);
  } catch (err) {
    console.error("Error in /tasksByDate:", err);
    res.status(500).json({ error: "Failed to get tasks by date" });
  } finally {
    await session.close();
  }
});



router.get("/tasksByStatus", async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (s:Status)<-[:HAS_STATUS]-(t:Task)
      RETURN s.name AS status, count(t) AS count
      ORDER BY count DESC
    `);
    const data = result.records.map(r => ({
      status: r.get("status"),
      count: r.get("count").toInt()
    }));
    res.json(data);
  } catch (err) {
    console.error("Error in /tasksByStatus:", err);
    res.status(500).json({ error: "Failed to get tasks by status" });
  } finally {
    await session.close();
  }
});

// GET /api/status/tasks-per-user
router.get("/tasks-per-user", async (req, res) => {
  try {
    const result = await neo4jQuery(`
      MATCH (u:User)-[:ASSIGNED_TO]->(t:Task)
      RETURN u.name AS user, count(t) AS taskCount
      ORDER BY taskCount DESC
    `);

    console.log("✅ Neo4j query result:", result);

    const formatted = result.records.map((record) => ({
      user: record.get("user"),
      taskCount: record.get("taskCount").toInt?.() ?? record.get("taskCount"),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ REAL ERROR from Neo4j:", err); // SHOW THIS!
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.get("/top-blocked-tasks", async (req, res) => {
  try {
    const result = await neo4jQuery(`
      MATCH (t:Task)<-[:DEPENDS_ON]-(dependent:Task)
      RETURN t.title AS task, count(dependent) AS dependentCount
      ORDER BY dependentCount DESC
      LIMIT 5
    `);

    const formatted = result.records.map((record) => ({
      task: record.get("task"),
      dependentCount: record.get("dependentCount").toInt?.() ?? record.get("dependentCount"),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching top blocked tasks:", err);
    res.status(500).json({ error: "Failed to fetch top blocked tasks" });
  }
});


router.get("/overdue-by-status", async (req, res) => {
  try {
    const result = await neo4jQuery(`
      MATCH (t:Task)-[:HAS_STATUS]->(s:Status)
      WHERE t.dueDate < date() AND (t.completed IS NULL OR t.completed = false)
      RETURN s.name AS status, count(t) AS overdueCount
      ORDER BY overdueCount DESC
    `);

    const formatted = result.records.map((record) => ({
      status: record.get("status"),
      overdueCount: record.get("overdueCount").toInt?.() ?? record.get("overdueCount"),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching overdue-by-status:", err);
    res.status(500).json({ error: "Failed to fetch overdue status breakdown" });
  }
});

router.get("/tasks-by-date", async (req, res) => {
  try {
    const result = await neo4jQuery(`
      MATCH (t:Task)
      WHERE t.createdAt IS NOT NULL
      RETURN 
        apoc.date.format(t.createdAt, "ms", "yyyy-MM-dd") AS createdDate, 
        count(*) AS taskCount
      ORDER BY createdDate
    `);

    const formatted = result.records.map((record) => ({
      date: record.get("createdDate"),
      taskCount: record.get("taskCount").toInt?.() ?? record.get("taskCount"),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching tasks by date:", err);
    res.status(500).json({ error: "Failed to fetch task timeline" });
  }
});




module.exports = router;

