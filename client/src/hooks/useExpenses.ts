import { useCallback, useEffect, useState } from "react";

export const API_BASE = import.meta.env.VITE_API_URL || "";

export const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Food: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "#10b981" },
  Transport: { bg: "bg-blue-100", text: "text-blue-700", dot: "#3b82f6" },
  Bills: { bg: "bg-red-100", text: "text-red-700", dot: "#ef4444" },
  Entertainment: { bg: "bg-purple-100", text: "text-purple-700", dot: "#a855f7" },
  Other: { bg: "bg-slate-100", text: "text-slate-700", dot: "#64748b" },
};

const currencyFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (n: number | string | undefined | null) =>
  currencyFmt.format(Number(n) || 0);

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt?: string;
}

export interface Summary {
  totalThisMonth: number;
  topCategory: { category: string; amount: number } | null;
  highestExpense: { category: string; amount: number } | null;
  byCategoryThisMonth: { category: string; amount: number }[];
}

export interface Filters {
  category: string;
  from: string;
  to: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = text;
    try { const p = JSON.parse(text); msg = p.error || text; } catch (_) {}
    throw new Error(msg || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "All") params.set("category", filters.category);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useExpenses(filters: Filters) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, sum] = await Promise.all([
        request<Expense[]>(`/api/expenses${buildQuery(filters)}`),
        request<Summary>(`/api/expenses/summary`),
      ]);
      setExpenses(list || []);
      setSummary(sum);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err?.message || "Failed to load. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createExpense = async (data: Omit<Expense, "id" | "createdAt">) => {
    await request<Expense>(`/api/expenses`, { method: "POST", body: JSON.stringify(data) });
    await fetchAll();
  };

  const updateExpense = async (id: string, data: Omit<Expense, "id" | "createdAt">) => {
    await request<Expense>(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) });
    await fetchAll();
  };

  const deleteExpense = async (id: string) => {
    await request<null>(`/api/expenses/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  return { expenses, summary, loading, error, refresh: fetchAll, createExpense, updateExpense, deleteExpense };
}
