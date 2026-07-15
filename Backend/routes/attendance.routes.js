const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const [attendance] = await pool.query(
      "SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC",
      [studentId]
    );

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get attendance",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { student_id, date, status } = req.body;

    await pool.query(
      `INSERT INTO attendance (student_id, date, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [student_id, date, status]
    );

    res.status(201).json({
      message: "Attendance saved successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save attendance",
      error: error.message
    });
  }
});

module.exports = router;