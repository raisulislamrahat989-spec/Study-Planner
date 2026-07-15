const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [admins] = await pool.query("SELECT * FROM admins WHERE email = ?", [
      email
    ]);

    if (admins.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const admin = admins[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = createToken({
      id: admin.id,
      role: "admin"
    });

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin"
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin login failed",
      error: error.message
    });
  }
});

router.post("/student-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [students] = await pool.query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );

    if (students.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const student = students[0];

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = createToken({
      id: student.id,
      role: "student"
    });

    res.json({
      message: "Student login successful",
      token,
      user: {
        id: student.id,
        name: student.name,
        roll: student.roll,
        class_name: student.class_name,
        email: student.email,
        role: "student"
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Student login failed",
      error: error.message
    });
  }
});

router.post("/register-student", async (req, res) => {
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
      message: "Student registered successfully",
      student_id: studentId
    });
  } catch (error) {
    res.status(500).json({
      message: "Student registration failed",
      error: error.message
    });
  }
});

module.exports = router;