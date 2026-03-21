const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Store users + tokens
const issuedUsers = new Map();   // for email lock
const validTokens = new Map();   // for unique links

// File path
const EMAIL_FILE = path.join(__dirname, "emails.json");

// Serve frontend
// Serve frontend
app.use("/static", express.static("public"));

/* ==============================
   🔐 GENERATE UNIQUE LINK
============================== */
app.get("/generate-link", (req, res) => {
  const token = Math.random().toString(36).substring(2, 10);

  validTokens.set(token, Date.now());

  res.json({
    link: `https://sm-practice-test-email.onrender.com/?token=${token}`
  });
});

/* ==============================
   💰 AFTER PAYMENT REDIRECT  ← ADD HERE
============================== */
app.get("/after-payment", (req, res) => {
  const token = Math.random().toString(36).substring(2, 10);

  validTokens.set(token, Date.now());

  res.redirect(`/?token=${token}`);
});

/* ==============================
   🔐 PROTECTED HOME PAGE
============================== */
app.get("/", (req, res) => {

  const token = req.query.token;

  // ❌ No token
  if (!token || !validTokens.has(token)) {
    return res.send("❌ Invalid or missing access link");
  }

  // ⏱ Expire after 5 minutes
  const createdTime = validTokens.get(token);
  if (Date.now() - createdTime > 5 * 60 * 1000) {
    validTokens.delete(token);
    return res.send("❌ Link expired");
  }

  // 🔥 One-time use
  validTokens.delete(token);

  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ==============================
   📧 EMAIL API (UNCHANGED LOGIC)
============================== */
app.get("/email", (req, res) => {

  const category = req.query.category;
  if (!category) return res.status(400).json({ message: "Category missing" });

  const userKey = req.ip + "|" + req.headers["user-agent"];
  const now = Date.now();

  const lockTime = 5 * 60 * 1000;

  if (issuedUsers.has(userKey)) {
    const lastTime = issuedUsers.get(userKey);
    if (now - lastTime < lockTime) {
      return res.status(403).json({
        message: "You are paid for only one registered email."
      });
    }
  }

  if (!fs.existsSync(EMAIL_FILE)) {
    return res.status(500).json({ message: "emails.json not found" });
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(EMAIL_FILE, "utf8"));
  } catch {
    return res.status(500).json({ message: "Invalid JSON format" });
  }

  if (!data[category]) {
    return res.status(404).json({ message: "Invalid category" });
  }

  const nextEmail = data[category].find(e => !e.used);
  if (!nextEmail) {
    return res.json({ message: "No emails left for this category" });
  }

  nextEmail.used = true;
  fs.writeFileSync(EMAIL_FILE, JSON.stringify(data, null, 2));

  issuedUsers.set(userKey, now);

  res.json({ email: nextEmail.email });
});

/* ==============================
   🚀 START SERVER
============================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));