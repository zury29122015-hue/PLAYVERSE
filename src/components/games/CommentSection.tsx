"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";

export interface CommentData {
  id: string;
  body: string;
  createdAt: string;
  user: { username: string; avatarUrl: string | null };
}

export function CommentSection({
  gameId,
  initialComments,
  isAuthed,
}: {
  gameId: string;
  initialComments: CommentData[];
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch(`/api/games/${gameId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setBody("");
    }
    setSending(false);
  }

  return (
    <div>
      <h2 className="text-lg font-display font-bold mb-3">Comentarios ({comments.length})</h2>
      <form onSubmit={submit} className="flex gap-2 mb-5">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={isAuthed ? "Escribe un comentario..." : "Inicia sesión para comentar"}
          className="flex-1 bg-pv-panel2 border border-pv-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pv-purple"
        />
        <button
          type="submit"
          disabled={sending}
          className="pv-btn-primary px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-pv-panel2 shrink-0 flex items-center justify-center text-xs">
              {c.user.username[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-semibold">@{c.user.username}</span>{" "}
                <span className="text-pv-muted text-xs">{timeAgo(c.createdAt)}</span>
              </p>
              <p className="text-sm text-pv-text/90">{c.body}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-pv-muted">Sé el primero en comentar.</p>}
      </div>
    </div>
  );
}
