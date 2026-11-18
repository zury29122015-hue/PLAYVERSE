import Link from "next/link";
import { db } from "@/lib/db";
import { ClipboardList, Flag, Gamepad2, Users } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [pending, users, games, reports] = await Promise.all([
    db.gameSubmission.count({ where: { status: "PENDING" } }),
    db.user.count(),
    db.game.count({ where: { status: "PUBLISHED" } }),
    db.report.count({ where: { status: "PENDING" } }),
  ]);

  const cards = [
    { href: "/admin/pending", label: "Juegos pendientes", value: pending, icon: ClipboardList, accent: "text-yellow-400" },
    { href: "/admin/users", label: "Usuarios registrados", value: users, icon: Users, accent: "text-pv-blue2" },
    { href: "/explore", label: "Juegos publicados", value: games, icon: Gamepad2, accent: "text-emerald-400" },
    { href: "/admin/reports", label: "Reportes pendientes", value: reports, icon: Flag, accent: "text-red-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold mb-2">Panel de administración</h1>
      <AdminNav />
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="pv-card rounded-xl p-5 hover:border-pv-purple transition-colors">
            <c.icon className={c.accent} size={22} />
            <p className="text-2xl font-bold mt-2">{c.value}</p>
            <p className="text-sm text-pv-muted">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
