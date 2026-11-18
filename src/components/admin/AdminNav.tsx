import Link from "next/link";

export function AdminNav() {
  return (
    <div className="flex gap-2 mb-6 text-sm">
      <Link href="/admin" className="px-3 py-1.5 rounded-full border border-pv-border hover:border-pv-purple">
        Dashboard
      </Link>
      <Link href="/admin/pending" className="px-3 py-1.5 rounded-full border border-pv-border hover:border-pv-purple">
        Pendientes
      </Link>
      <Link href="/admin/users" className="px-3 py-1.5 rounded-full border border-pv-border hover:border-pv-purple">
        Usuarios
      </Link>
      <Link href="/admin/reports" className="px-3 py-1.5 rounded-full border border-pv-border hover:border-pv-purple">
        Reportes
      </Link>
    </div>
  );
}
