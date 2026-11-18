import Link from "next/link";
import { FolderUp, Code2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const OPTIONS = [
  {
    href: "/create/import",
    icon: FolderUp,
    title: "IMPORT GAME",
    subtitle: "Importa un videojuego que ya hayas creado",
    description:
      "Sube un ZIP, HTML5, o una exportación de Unity WebGL / Godot. Detectamos automáticamente el archivo de inicio.",
    accent: "from-pv-blue to-pv-cyan",
  },
  {
    href: "/create/code",
    icon: Code2,
    title: "CODE STUDIO",
    subtitle: "Programa tu propio videojuego",
    description: "Editor de código con HTML, CSS y JavaScript. Ejecuta tu juego en un entorno aislado y seguro.",
    accent: "from-emerald-500 to-pv-cyan",
  },
];

export default function CreateHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold text-center">¿Cómo quieres crear tu videojuego?</h1>
      <p className="text-pv-muted text-center mt-2 max-w-xl mx-auto">
        Elige una de las dos formas de crear en PlayVerse. Podrás probar tu juego antes de enviarlo a revisión.
      </p>

      <div className="grid md:grid-cols-2 gap-5 mt-10 max-w-2xl mx-auto">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className="pv-card rounded-2xl p-6 flex flex-col hover:border-pv-purple hover:shadow-glow transition-all group"
          >
            <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.accent} flex items-center justify-center mb-4`}>
              <opt.icon size={22} className="text-white" />
            </span>
            <h2 className="font-display font-bold text-lg">{opt.title}</h2>
            <p className="text-sm text-pv-purple2 mt-0.5">{opt.subtitle}</p>
            <p className="text-sm text-pv-muted mt-3 flex-1">{opt.description}</p>
            <span className="mt-4 text-sm font-medium flex items-center gap-1 text-white/90 group-hover:gap-2 transition-all">
              Empezar <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
