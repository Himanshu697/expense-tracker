import { CATEGORY_STYLES, formatCurrency, type Expense } from "../hooks/useExpenses";

function formatDate(d: string) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function exportToCSV(expenses: Expense[]) {
  const headers = ["Date", "Category", "Amount (₹)", "Note"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toString(),
    e.note || "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  onEdit: (exp: Expense) => void;
  onDelete: (exp: Expense) => void;
}

export default function ExpenseTable({ expenses, loading, error, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center">
        <p className="text-sm text-slate-500">No expenses yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={() => exportToCSV(expenses)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          ⬇️ Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => {
                const style = CATEGORY_STYLES[e.category] ?? CATEGORY_STYLES.Other;
                return (
                  <tr key={String(e.id)} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.note || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEdit(e)}
                        className="mr-1 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(e)}
                        className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}