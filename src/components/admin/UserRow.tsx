"use client";

import { useState } from "react";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
}

export function UserRow({ user }: { user: AdminUser }) {
  const [status, setStatus] = useState(user.status);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (res.ok) setStatus(next);
  }

  return (
    <tr className="border-b border-pv-border/50">
      <td className="py-2 px-3">@{user.username}</td>
      <td className="py-2 px-3 text-pv-muted">{user.email}</td>
      <td className="py-2 px-3">{user.role}</td>
      <td className="py-2 px-3">
        <span className={status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}>{status}</span>
      </td>
      <td className="py-2 px-3 text-right">
        {user.role !== "ADMIN" && (
          <button
            onClick={toggle}
            disabled={loading}
            className="text-xs px-3 py-1 rounded-full border border-pv-border hover:border-pv-purple disabled:opacity-60"
          >
            {status === "ACTIVE" ? "Suspender" : "Reactivar"}
          </button>
        )}
      </td>
    </tr>
  );
}
