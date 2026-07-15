const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = require("./db");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const planRoutes = require("./routes/plan.routes");
const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(cors());
app.use(express.json());

async function createDefaultAdmin() {
  try {
    const [admins] = await pool.query("SELECT * FROM admins WHERE email = ?", [
      "admin@school.com"
    ]);

    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await pool.query(
        "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
        ["Teacher Admin", "admin@school.com", hashedPassword]
      );

      console.log("Default admin created");
    }
  } catch (error) {
    console.log("Default admin create error:", error.message);
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Study Attendance Backend Running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await createDefaultAdmin();
  console.log(`Server running on http://localhost:${PORT}`);
});