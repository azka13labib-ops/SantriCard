import React from "react";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-800/60 ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const hasWidth = /\bw-\w+/.test(className);
  return (
    <Skeleton className={`h-4 ${hasWidth ? "" : "w-full"} ${className}`} {...props} />
  );
}

export function SkeletonCard({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonKpiCard({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`} {...props}>
      <div className="absolute rounded-lg bg-slate-200/60 dark:bg-slate-800/60 p-3" style={{ width: '48px', height: '48px' }} />
      <div className="ml-16 space-y-2 pt-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}

export function SkeletonTable({ columns = 4, rows = 5, className = "" }: { columns?: number, rows?: number, className?: string }) {
  return (
    <div className={`w-full overflow-auto bg-white rounded-lg shadow-sm border ${className}`}>
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 border-b">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="h-12 px-6 py-3 align-middle font-medium">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b transition-colors hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-6 py-4 align-middle">
                  <Skeleton className="h-4 w-full max-w-36" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonList({ items = 4, className = "" }: { items?: number, className?: string }) {
  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-1/5 max-w-20" />
        </div>
      ))}
    </div>
  );
}
