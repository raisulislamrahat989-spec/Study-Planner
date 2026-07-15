const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [students] = await pool.query(
      "SELECT id, name, roll, class_name, email, created_at FROM students ORDER BY id DESC"
    );

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get students",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const [students] = await pool.query(
      "SELECT id, name, roll, class_name, email, created_at FROM students WHERE id = ?",
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const [subjects] = await pool.query(
      "SELECT * FROM subjects WHERE student_id = ?",
      [studentId]
    );

    const [attendance] = await pool.query(
      "SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC",
      [studentId]
    );

    const [plans] = await pool.query(
      "SELECT * FROM study_plans WHERE student_id = ? ORDER BY plan_date ASC",
      [studentId]
    );

    const [tasks] = await pool.query(
      "SELECT * FROM tasks WHERE student_id = ? ORDER BY id DESC",
      [studentId]
    );

    res.json({
      student: students[0],
      subjects,
      attendance,
      plans,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get student",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, roll, class_name, email, password } = req.body;

    const finalPassword = password || "student123";
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const [result] = await pool.query(
      "INSERT INTO students (name, roll, class_name, email, password) VALUES (?, ?, ?, ?, ?)",
      [name, roll, class_name, email, hashedPassword]
    );

    const studentId = result.insertId;

    const defaultSubjects = ["Mathematics", "English", "Physics", "ICT"];

    for (const subject of defaultSubjects) {
      await pool.query(
        "INSERT INTO subjects (student_id, name, progress) VALUES (?, ?, ?)",
        [studentId, subject, 0]
      );
    }

    res.status(201).json({
      message: "Student added successfully",
      student_id: studentId
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add student",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    await pool.query("DELETE FROM students WHERE id = ?", [studentId]);

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
      error: error.message
    });
  }
});

router.post("/:id/subjects", async (req, res) => {
  try {
    const studentId = req.params.id;
    const { name, progress } = req.body;

    const [result] = await pool.query(
      "INSERT INTO subjects (student_id, name, progress) VALUES (?, ?, ?)",
      [studentId, name, progress || 0]
    );

    res.status(201).json({
      message: "Subject added successfully",
      subject_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add subject",
      error: error.message
    });
  }
});

router.put("/:studentId/subjects/:subjectId/progress", async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    const { progress } = req.body;

    await pool.query(
      "UPDATE subjects SET progress = ? WHERE id = ? AND student_id = ?",
      [progress, subjectId, studentId]
    );

    res.json({
      message: "Subject progress updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update progress",
      error: error.message
    });
  }
});

module.exports = router;