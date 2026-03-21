// server.js
import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---- Database (lowdb stores in db.json) ----
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { students: {}, invoices: {} });

await db.read();
db.data ||= { students: {}, invoices: {} };

// ---- Students ----
app.get("/students", (req, res) => {
  res.json({ students: db.data.students });
});

app.post("/students", async (req, res) => {
  const { name, phone, email, address, class: studentClass } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  db.data.students[name] = { phone, email, address, class: studentClass };
  await db.write();
  res.json({ success: true, student: db.data.students[name] });
});

// ---- Invoices ----
app.get("/invoices", (req, res) => {
  res.json({ invoices: db.data.invoices });
});

app.get("/invoices/:invoiceNo", (req, res) => {
  const invoice = db.data.invoices[req.params.invoiceNo];
  if (!invoice) return res.status(404).json({ error: "Not found" });
  res.json(invoice);
});

app.post("/invoices", async (req, res) => {
  const { invoiceNo } = req.body;
  if (!invoiceNo) return res.status(400).json({ error: "Invoice number required" });

  db.data.invoices[invoiceNo] = req.body;
  await db.write();
  res.json({ success: true, invoice: db.data.invoices[invoiceNo] });
});

// ---- Start server ----
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
