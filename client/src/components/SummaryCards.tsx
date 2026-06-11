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

  return (
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
  );
}
