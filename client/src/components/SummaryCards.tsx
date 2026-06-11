import { formatCurrency, type Summary } from "../hooks/useExpenses";

function Card({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default function SummaryCards({ summary }: { summary: Summary | null }) {
  const total = summary?.totalThisMonth ?? 0;
  const top = summary?.topCategory ?? null;
  const highest = summary?.highestExpense ?? null;
  const byCategory = summary?.byCategoryThisMonth ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card icon="💰" label="Total This Month" value={formatCurrency(total)} />
        <Card
          icon="📊"
          label="Top Category This Month"
          value={top?.category ?? "—"}
          sub={top ? formatCurrency(top.amount) : "No spending yet"}
        />
        <Card
          icon="🏆"
          label="Highest Single Expense"
          value={highest ? formatCurrency(highest.amount) : "—"}
          sub={highest?.category}
        />
      </div>

      {byCategory.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">📋 Total Per Category (This Month)</h3>
          <div className="divide-y divide-slate-100">
            {byCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{item.category}</span>
                <span className="text-sm font-medium text-slate-900">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}