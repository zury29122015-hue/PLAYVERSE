import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { UserRow } from "@/components/admin/UserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, email: true, role: true, status: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold mb-2">Usuarios</h1>
      <AdminNav />
      <div className="pv-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pv-panel2 text-left text-pv-muted">
            <tr>
              <th className="py-2 px-3">Usuario</th>
              <th className="py-2 px-3">Correo</th>
              <th className="py-2 px-3">Rol</th>
              <th className="py-2 px-3">Estado</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
