// ==== server.js ====
import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// ==== Add JSON endpoints for your quizzes ====

// Chemistry JSON
app.get("/chemistry", (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "chemistry.json"), "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Unable to load Chemistry JSON" });
  }
});

// Physics JSON
app.get("/physics", (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "physics.json"), "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Unable to load Physics JSON" });
  }
});
// Biology JSON
app.get("/biology", (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "biology.json"), "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Unable to load Biology JSON" });
  }
});

// Math JSON
app.get("/math", (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "math.json"), "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Unable to load Math JSON" });
  }
});


// ==== AI endpoint ====
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/ask-ai", async (req, res) => {
  const { question } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert science teacher. Provide clear, step-by-step, exam-style solutions for Physics, Chemistry, Math, or Biology." },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "❌ No answer generated.";
    res.json({ answer });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ answer: "⚠️ Error contacting AI server." });
  }
});

// Listen on Render or local port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ AI backend running on port ${PORT}`));
