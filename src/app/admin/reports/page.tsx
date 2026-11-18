import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { ReportRow } from "@/components/admin/ReportRow";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await db.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { reporter: { select: { username: true } }, game: { select: { title: true, slug: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold mb-2">Reportes</h1>
      <AdminNav />
      {reports.length === 0 ? (
        <p className="text-pv-muted text-sm">No hay reportes pendientes.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportRow key={r.id} report={{ ...r, createdAt: r.createdAt.toISOString() }} />
          ))}
        </div>
      )}
    </div>
  );
}
