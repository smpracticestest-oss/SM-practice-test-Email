const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_DIR = path.join(__dirname, "data");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");

// Load JSON safely
function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return []; }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------------- LOGIN ----------------
app.post("/api/login", (req, res) => {
  let { studentId, password } = req.body;
  let students = readJSON(STUDENTS_FILE);

  let student = students.find(
    s => s.StudentID == studentId && (s.Password == password || s.DOB == password)
  );

  if (!student) return res.json({ found: false, message: "Invalid ID or password" });

  res.json({ found: true, student });
});

// ---------------- RECORD PAYMENT ----------------
app.post("/api/recordPayment", (req, res) => {
  let payments = readJSON(PAYMENTS_FILE);
  let entry = {
    timestamp: Date.now(),
    ...req.body
  };
  payments.push(entry);
  saveJSON(PAYMENTS_FILE, payments);
  res.json({ success: true });
});

// ---------------- PAYMENT HISTORY ----------------
app.get("/api/payments/:studentId", (req, res) => {
  let payments = readJSON(PAYMENTS_FILE);
  let filtered = payments.filter(p => p.studentId == req.params.studentId);
  res.json(filtered);
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
