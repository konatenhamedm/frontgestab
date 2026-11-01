"use client";
import React from "react";

// ─── Skeleton primitif ───────────────────────────────────────────────────
function Sk({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} style={style} />
  );
}

// ─── Skeleton KPI Card (compact) ─────────────────────────────────────────
export function KpiCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Sk className="h-3 w-28" />
        <Sk className="w-8 h-8 rounded-lg flex-shrink-0" />
      </div>
      <div>
        <Sk className="h-7 w-20 mb-1.5" />
        <Sk className="h-2.5 w-32" />
      </div>
    </div>
  );
}

// ─── Skeleton Chart Card ──────────────────────────────────────────────────
export function ChartCardSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <Sk className="h-4 w-40" />
        <Sk className="w-4 h-4 rounded" />
      </div>
      <div className={`p-5 ${height}`}>
        {/* Fake bars */}
        <div className="h-full flex items-end gap-2 pb-4">
          {[40, 65, 45, 80, 55, 70, 35, 90, 50, 75, 60, 85].map((h, i) => (
            <Sk key={i} className="flex-1" style={{ height: `${h}%` } as any} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Table Row ───────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Sk className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5">
            <Sk className="h-3 w-28" />
            <Sk className="h-2.5 w-20" />
          </div>
        </div>
      </td>
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Sk className="h-3 w-20" />
        </td>
      ))}
    </tr>
  );
}

// ─── Skeleton Stat Dashboard complet (page /statistiques) ────────────────
export function StatsDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Sk className="h-5 w-56" />
          <Sk className="h-3 w-80" />
        </div>
        <Sk className="h-9 w-48 rounded-xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <KpiCardSkeleton key={i} />)}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCardSkeleton height="h-64" />
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><Sk className="h-4 w-32" /></div>
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Sk className="w-5 h-5 rounded-full flex-shrink-0" />
                <Sk className="h-3 flex-1" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><Sk className="h-4 w-40" /></div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Sk className="w-9 h-9 rounded-lg flex-shrink-0" />
                <Sk className="h-3 flex-1" />
                <Sk className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><Sk className="h-4 w-40" /></div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Sk className="w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-3 w-32" />
                  <Sk className="h-2.5 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Notification Page ───────────────────────────────────────────
export function NotificationPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Sk className="h-5 w-64" />
          <Sk className="h-3 w-80" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><Sk className="h-4 w-40" /></div>
          <div className="p-5 space-y-4">
            <Sk className="h-10 rounded-lg" />
            <Sk className="h-10 rounded-lg" />
            <Sk className="h-32 rounded-lg" />
            <Sk className="h-11 rounded-lg" />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><Sk className="h-4 w-32" /></div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3">
                  <Sk className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Sk className="h-3 w-36" />
                    <Sk className="h-2.5 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Super Admin Dashboard Skeleton ─────────────────────────────────────────
export function SuperAdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Skeleton Compact Header */}
      <div className="relative overflow-hidden bg-[#0A1628] p-6 rounded-[12px] border border-white/5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Sk className="h-12 w-12 rounded-2xl bg-white/10" />
            <div className="space-y-2">
              <Sk className="h-5 w-40 bg-white/10" />
              <Sk className="h-2 w-24 bg-white/10" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sk className="h-10 w-64 rounded-2xl bg-white/10" />
            <Sk className="h-10 w-24 rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>

      {/* Skeleton Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Sk key={i} className="h-10 w-32 rounded-2xl flex-shrink-0" />
        ))}
      </div>

      {/* Skeleton Grid */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <KpiCardSkeleton key={i} />)}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCardSkeleton height="h-64" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <Sk className="h-4 w-32" />
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5">
                  <Sk className="h-3 w-28" />
                  <Sk className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
