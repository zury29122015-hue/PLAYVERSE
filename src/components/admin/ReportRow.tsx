"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export interface AdminReport {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  reporter: { username: string };
  game: { title: string; slug: string } | null;
}

export function ReportRow({ report }: { report: AdminReport }) {
  const [resolved, setResolved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function act(status: "RESOLVED" | "DISMISSED", suspendGame?: boolean) {
    setLoading(true);
    const res = await fetch(`/api/admin/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, suspendGame }),
    });
    setLoading(false);
    if (res.ok) setResolved(true);
  }

  if (resolved) return null;

  return (
    <div className="pv-card rounded-xl p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{report.reason}</p>
          {report.game && (
            <Link href={`/game/${report.game.slug}`} className="text-sm text-pv-purple2 hover:underline">
              {report.game.title}
            </Link>
          )}
          <p className="text-xs text-pv-muted mt-1">
            reportado por @{report.reporter.username} · {timeAgo(report.createdAt)}
          </p>
          {report.details && <p className="text-sm mt-2 text-pv-text/80">{report.details}</p>}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => act("DISMISSED")} disabled={loading} className="text-xs px-3 py-1.5 rounded-full border border-pv-border">
          Descartar
        </button>
        <button onClick={() => act("RESOLVED")} disabled={loading} className="text-xs px-3 py-1.5 rounded-full bg-emerald-600">
          Marcar resuelto
        </button>
        {report.game && (
          <button onClick={() => act("RESOLVED", true)} disabled={loading} className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-400">
            Suspender juego
          </button>
        )}
      </div>
    </div>
  );
}
