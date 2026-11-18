"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, MessageSquare, X } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export interface PendingSubmission {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  entryFile: string | null;
  createdAt: string;
  submitter: { username: string };
  project: { kind: string };
}

export function PendingCard({ submission }: { submission: PendingSubmission }) {
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState<"REJECT" | "REQUEST_CHANGES" | null>(null);
  const [resolved, setResolved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function decide(decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES") {
    setLoading(true);
    const res = await fetch(`/api/submissions/${submission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note: note || undefined }),
    });
    setLoading(false);
    if (res.ok) setResolved(true);
  }

  if (resolved) return null;

  return (
    <div className="pv-card rounded-xl p-4">
      <div className="flex gap-4">
        <div className="w-28 h-20 rounded-lg bg-pv-panel2 overflow-hidden shrink-0">
          {submission.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={submission.coverImage} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{submission.title}</h3>
            <span className="text-[10px] uppercase bg-pv-panel2 px-2 py-0.5 rounded-full text-pv-muted">{submission.project.kind}</span>
          </div>
          <p className="text-xs text-pv-muted">
            por @{submission.submitter.username} · {timeAgo(submission.createdAt)}
          </p>
          <p className="text-sm mt-1 line-clamp-2 text-pv-text/80">{submission.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <Link href={`/admin/pending/${submission.id}`} className="text-xs text-pv-purple2 hover:underline mr-auto">
          Ver detalles y probar
        </Link>
        <button
          onClick={() => decide("APPROVE")}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-sm font-medium disabled:opacity-60"
        >
          <Check size={14} /> APPROVE
        </button>
        <button
          onClick={() => setShowNote(showNote === "REQUEST_CHANGES" ? null : "REQUEST_CHANGES")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-orange-500 text-orange-400 text-sm font-medium"
        >
          <MessageSquare size={14} /> REQUEST CHANGES
        </button>
        <button
          onClick={() => setShowNote(showNote === "REJECT" ? null : "REJECT")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-500 text-red-400 text-sm font-medium"
        >
          <X size={14} /> REJECT
        </button>
      </div>

      {showNote && (
        <div className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motivo (se enviará al creador)"
            className="pv-input flex-1"
          />
          <button
            onClick={() => decide(showNote)}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-pv-panel2 border border-pv-border text-sm"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
