const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const [tasks] = await pool.query(
      "SELECT * FROM tasks WHERE student_id = ? ORDER BY id DESC",
      [studentId]
    );

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get tasks",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { student_id, title, subject, done } = req.body;

    const [result] = await pool.query(
      "INSERT INTO tasks (student_id, title, subject, done) VALUES (?, ?, ?, ?)",
      [student_id, title, subject, done || false]
    );

    res.status(201).json({
      message: "Task added successfully",
      task_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add task",
      error: error.message
    });
  }
});

router.put("/:id/done", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { done } = req.body;

    await pool.query("UPDATE tasks SET done = ? WHERE id = ?", [
      done,
      taskId
    ]);

    res.json({
      message: "Task status updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message
    });
  }
});

router.put("/:id/review", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { teacher_comment } = req.body;

    await pool.query(
      "UPDATE tasks SET reviewed = true, teacher_comment = ? WHERE id = ?",
      [teacher_comment, taskId]
    );

    res.json({
      message: "Task reviewed successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to review task",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    await pool.query("DELETE FROM tasks WHERE id = ?", [taskId]);

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
});

module.exports = router;