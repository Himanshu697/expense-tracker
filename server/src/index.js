import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = join(__dirname, "../data/expenses.json");

// ── helpers ──────────────────────────────────────────────────────────────────

function loadExpenses() {
  try {
    if (existsSync(DB_FILE)) {
      const raw = readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (_) {}
  return [];
}

function saveExpenses(expenses) {
  try {
    const dir = join(__dirname, "../data");
    if (!existsSync(dir)) {
      import("fs").then((fs) => fs.mkdirSync(dir, { recursive: true }));
    }
    writeFileSync(DB_FILE, JSON.stringify(expenses, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist expenses:", err.message);
  }
}

// Ensure data directory exists on startup
import { mkdirSync } from "fs";
try { mkdirSync(join(__dirname, "../data"), { recursive: true }); } catch (_) {}

let expenses = loadExpenses();

// ── app ───────────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

// ── GET /api/expenses ─────────────────────────────────────────────────────────
// Query params: category, from (YYYY-MM-DD), to (YYYY-MM-DD)
app.get("/api/expenses", (req, res) => {
  const { category, from, to } = req.query;

  let result = [...expenses];

  if (category && category !== "All") {
    result = result.filter((e) => e.category === category);
  }

  if (from) {
    result = result.filter((e) => e.date >= from);
  }

  if (to) {
    result = result.filter((e) => e.date <= to);
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(result);
});

// ── GET /api/expenses/summary ─────────────────────────────────────────────────
app.get("/api/expenses/summary", (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const thisMonth = expenses.filter(
    (e) => e.date >= monthStart && e.date <= monthEnd
  );

  // Total this month
  const totalThisMonth = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);

  // By category this month
  const catMap = {};
  thisMonth.forEach((e) => {
    catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
  });
  const byCategoryThisMonth = Object.entries(catMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Top category this month
  const topCategory = byCategoryThisMonth.length > 0 ? byCategoryThisMonth[0] : null;

  // Highest single expense (all time)
  const highestExpense =
    expenses.length > 0
      ? expenses.reduce((max, e) =>
          Number(e.amount) > Number(max.amount) ? e : max
        )
      : null;

  res.json({
    totalThisMonth,
    topCategory,
    highestExpense: highestExpense
      ? { category: highestExpense.category, amount: Number(highestExpense.amount) }
      : null,
    byCategoryThisMonth,
  });
});

// ── GET /api/expenses/:id ──────────────────────────────────────────────────────
app.get("/api/expenses/:id", (req, res) => {
  const expense = expenses.find((e) => e.id === req.params.id);
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  res.json(expense);
});

// ── POST /api/expenses ────────────────────────────────────────────────────────
app.post("/api/expenses", (req, res) => {
  const { amount, category, date, note } = req.body;

  // Validation
  const errors = {};
  const amt = parseFloat(amount);
  if (!amount || isNaN(amt) || amt <= 0)
    errors.amount = "Amount must be a positive number";
  if (!category) errors.category = "Category is required";
  const validCategories = ["Food", "Transport", "Bills", "Entertainment", "Other"];
  if (category && !validCategories.includes(category))
    errors.category = "Invalid category";
  if (!date) errors.date = "Date is required";
  else if (date > new Date().toISOString().slice(0, 10))
    errors.date = "Date cannot be in the future";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const expense = {
    id: uuidv4(),
    amount: amt,
    category,
    date,
    note: note?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  expenses.push(expense);
  saveExpenses(expenses);

  res.status(201).json(expense);
});

// ── PUT /api/expenses/:id ─────────────────────────────────────────────────────
app.put("/api/expenses/:id", (req, res) => {
  const index = expenses.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Expense not found" });

  const { amount, category, date, note } = req.body;

  // Validation
  const errors = {};
  const amt = parseFloat(amount);
  if (!amount || isNaN(amt) || amt <= 0)
    errors.amount = "Amount must be a positive number";
  if (!category) errors.category = "Category is required";
  const validCategories = ["Food", "Transport", "Bills", "Entertainment", "Other"];
  if (category && !validCategories.includes(category))
    errors.category = "Invalid category";
  if (!date) errors.date = "Date is required";
  else if (date > new Date().toISOString().slice(0, 10))
    errors.date = "Date cannot be in the future";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  expenses[index] = {
    ...expenses[index],
    amount: amt,
    category,
    date,
    note: note?.trim() || "",
    updatedAt: new Date().toISOString(),
  };

  saveExpenses(expenses);
  res.json(expenses[index]);
});

// ── DELETE /api/expenses/:id ──────────────────────────────────────────────────
app.delete("/api/expenses/:id", (req, res) => {
  const index = expenses.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Expense not found" });

  expenses.splice(index, 1);
  saveExpenses(expenses);

  res.status(204).send();
});

// ── health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
