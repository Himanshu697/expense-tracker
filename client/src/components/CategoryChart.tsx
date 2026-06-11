import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_STYLES, formatCurrency, type Summary } from "../hooks/useExpenses";

export default function CategoryChart({ summary }: { summary: Summary | null }) {
  const byCategory = summary?.byCategoryThisMonth ?? [];
  const data = byCategory
    .map((d) => ({ name: d.category, value: Number(d.amount) || 0 }))
    .filter((d: { name: string; value: number }) => d.value > 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Spending by Category</h3>
      <p className="mt-0.5 text-xs text-slate-500">Current month</p>
      <div className="mt-4 h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                paddingAngle={2}
              >
                {data.map((entry: { name: string; value: number }) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_STYLES[entry.name]?.dot ?? "#64748b"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v: number | string) => formatCurrency(v as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
