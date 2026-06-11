import { useMemo, useState } from "react";
import { CATEGORIES, useExpenses } from "./hooks/useExpenses";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import SummaryCards from "./components/SummaryCards";
import CategoryChart from "./components/CategoryChart";
import ConfirmDialog from "./components/ConfirmDialog";
import type { Expense } from "./hooks/useExpenses";

type RangeKey = "this" | "last" | "custom" | "all";

function startOfMonth(offset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 10);
}

function endOfMonth(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset + 1, 0);
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [category, setCategory] = useState("All");
  const [rangeKey, setRangeKey] = useState<RangeKey>("this");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const filters = useMemo(() => {
    let from = "";
    let to = "";
    if (rangeKey === "this") { from = startOfMonth(0); to = endOfMonth(0); }
    else if (rangeKey === "last") { from = startOfMonth(-1); to = endOfMonth(-1); }
    else if (rangeKey === "custom") { from = customFrom; to = customTo; }
    return { category, from, to };
  }, [category, rangeKey, customFrom, customTo]);

  const { expenses, summary, loading, error, createExpense, updateExpense, deleteExpense } =
    useExpenses(filters);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirm, setConfirm] = useState<Expense | null>(null);

  const handleAdd = () => { setEditing(null); setFormOpen(true); };
  const handleEdit = (exp: Expense) => { setEditing(exp); setFormOpen(true); };
  const handleSubmit = async (data: Omit<Expense, "id" | "createdAt">) => {
    if (editing) await updateExpense(editing.id, data);
    else await createExpense(data);
  };
  const handleDelete = async () => {
    if (!confirm) return;
    await deleteExpense(confirm.id);
    setConfirm(null);
  };

  const rangeBtn = (key: RangeKey, label: string) => (
    <button
      key={key}
      onClick={() => setRangeKey(key)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        rangeKey === key
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mini Expense Tracker</h1>
            <p className="text-sm text-slate-500">Track your daily spending across categories.</p>
          </div>
          <button
            onClick={handleAdd}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            + Add Expense
          </button>
        </header>

        {/* Summary Cards */}
        <section className="mb-6">
          <SummaryCards summary={summary} />
        </section>

        {/* Chart + Tips */}
        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CategoryChart summary={summary} />
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Quick Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Use filters to focus on a specific category or month.</li>
              <li>• Click ✏️ to edit and 🗑️ to delete an expense.</li>
              <li>• Amounts are formatted in INR (₹).</li>
              <li>• All data is saved to a JSON file on the server.</li>
            </ul>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="All">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {rangeBtn("this", "This Month")}
                {rangeBtn("last", "Last Month")}
                {rangeBtn("custom", "Custom")}
                {rangeBtn("all", "All Time")}
              </div>
            </div>

            {rangeKey === "custom" && (
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Expense Table */}
        <section>
          <ExpenseTable
            expenses={expenses}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={(e) => setConfirm(e)}
          />
        </section>
      </div>

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!confirm}
        title="Delete expense?"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
