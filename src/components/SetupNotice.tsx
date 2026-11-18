import { TriangleAlert } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="max-w-3xl mx-auto mt-10 mx-4 p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 flex gap-3">
      <TriangleAlert className="shrink-0 mt-0.5" size={20} />
      <div className="text-sm space-y-1">
        <p className="font-semibold">No se pudo conectar a la base de datos.</p>
        <p>
          Levanta Postgres con <code className="bg-black/30 px-1.5 py-0.5 rounded">docker compose up -d</code>, luego
          corre <code className="bg-black/30 px-1.5 py-0.5 rounded">npm run db:push</code> y{" "}
          <code className="bg-black/30 px-1.5 py-0.5 rounded">npm run db:seed</code>. Revisa el README para más
          detalles.
        </p>
      </div>
    </div>
  );
}
