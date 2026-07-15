const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const [plans] = await pool.query(
      "SELECT * FROM study_plans WHERE student_id = ? ORDER BY plan_date ASC",
      [studentId]
    );

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get study plans",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { student_id, plan_date, subject, topic, plan_time } = req.body;

    const [result] = await pool.query(
      "INSERT INTO study_plans (student_id, plan_date, subject, topic, plan_time) VALUES (?, ?, ?, ?, ?)",
      [student_id, plan_date, subject, topic, plan_time || "8:00 PM"]
    );

    res.status(201).json({
      message: "Study plan added successfully",
      plan_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add study plan",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const planId = req.params.id;

    await pool.query("DELETE FROM study_plans WHERE id = ?", [planId]);

    res.json({
      message: "Study plan deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete study plan",
      error: error.message
    });
  }
});

module.exports = router;