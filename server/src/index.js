import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import multer from "multer";
import pdfParse from "pdf-parse";

import db from "./db.js";
import { signToken, requireAuth } from "./auth.js";
import { signupSchema, loginSchema, appSchema } from "./validators.js";
import { enhanceOffline } from "./resumeEnhancer.js";

dotenv.config();

const app = express();

// IMPORTANT: use memory storage so req.file.buffer exists
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB


app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ ok: true, name: "InternTrack API" }));

// ---- Auth ----
app.post("/api/auth/signup", (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, password } = parsed.data;
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const password_hash = bcrypt.hashSync(password, 10);
  const created_at = new Date().toISOString();

  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .run(name, email, password_hash, created_at);

  const token = signToken({ userId: info.lastInsertRowid, email, name });
  return res.json({ token, user: { id: info.lastInsertRowid, name, email } });
});

app.post("/api/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = db.prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ userId: user.id, email: user.email, name: user.name });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ---- Applications (protected) ----
app.get("/api/apps", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY updated_at DESC")
    .all(req.user.userId);
  res.json(rows);
});

app.post("/api/apps", requireAuth, (req, res) => {
  const parsed = appSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const now = new Date().toISOString();
  const data = parsed.data;

  const info = db
    .prepare(`
      INSERT INTO applications (user_id, company, role, location, status, url, notes, applied_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      req.user.userId,
      data.company,
      data.role,
      data.location ?? "",
      data.status ?? "Applied",
      data.url ?? "",
      data.notes ?? "",
      data.applied_date ?? "",
      now,
      now
    );

  const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(info.lastInsertRowid);
  res.json(row);
});

app.put("/api/apps/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const parsed = appSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = db.prepare("SELECT * FROM applications WHERE id = ? AND user_id = ?").get(id, req.user.userId);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updated_at = new Date().toISOString();
  const next = { ...existing, ...parsed.data, updated_at };

  db.prepare(`
      UPDATE applications
      SET company=?, role=?, location=?, status=?, url=?, notes=?, applied_date=?, updated_at=?
      WHERE id=? AND user_id=?
    `).run(
    next.company,
    next.role,
    next.location,
    next.status,
    next.url,
    next.notes,
    next.applied_date,
    next.updated_at,
    id,
    req.user.userId
  );

  const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(id);
  res.json(row);
});

app.delete("/api/apps/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM applications WHERE id = ? AND user_id = ?").run(id, req.user.userId);
  res.json({ deleted: info.changes > 0 });
});

// ---- Resume enhancer (TEXT) (protected) ----
app.post("/api/resume/enhance", requireAuth, (req, res) => {
  const resumeText = String(req.body?.resumeText || "");
  const jobDescription = String(req.body?.jobDescription || "");

  if (!resumeText.trim()) return res.status(400).json({ error: "resumeText is required" });

  const result = enhanceOffline({ resumeText, jobDescription });
  res.json(result);
});

// ---- Resume enhancer (TEXT) (protected) ----
app.post("/api/resume/enhance", requireAuth, (req, res) => {
  const resumeText = String(req.body?.resumeText || "");
  const jobDescription = String(req.body?.jobDescription || "");
  if (!resumeText.trim()) return res.status(400).json({ error: "resumeText is required" });

  const result = enhanceOffline({ resumeText, jobDescription });
  res.json(result);
});

// ---- Resume enhancer (PDF upload) (protected) ----
app.post("/api/resume/enhance-pdf", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file is required (field name: file)" });
    const jobDescription = String(req.body?.jobDescription || "");

    const parsed = await pdfParse(req.file.buffer);
    const resumeText = String(parsed?.text || "").trim();

    if (!resumeText) {
      return res.status(400).json({
        error: "Could not extract text from the PDF. Try a text-based PDF (not scanned images).",
      });
    }

    const result = enhanceOffline({ resumeText, jobDescription });
    res.json({ ...result, extractedChars: resumeText.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to parse PDF. Make sure it's a valid, text-based PDF." });
  }
});


const port = process.env.PORT || 4000;
app.get("/debug/routes", (req, res) => {
  const routes = app._router.stack
    .filter(r => r.route)
    .map(r => ({ path: r.route.path, methods: Object.keys(r.route.methods) }));
  res.json(routes);
});

app.listen(port, () => console.log(`InternTrack API running on http://localhost:${port}`));
