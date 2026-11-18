import Link from "next/link";
import * as icons from "lucide-react";
import type { Category } from "@prisma/client";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-display font-bold mb-3">Categorías</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((c) => {
          const Icon = (icons as unknown as Record<string, icons.LucideIcon>)[toPascalCase(c.icon)] ?? icons.Gamepad2;
          return (
            <Link
              key={c.id}
              href={`/explore?category=${c.slug}`}
              className="pv-card rounded-xl p-4 flex items-center gap-3 hover:border-pv-purple hover:shadow-glow-sm transition-all"
            >
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-pv-purple/30 to-pv-blue/30 flex items-center justify-center text-pv-purple2">
                <Icon size={18} />
              </span>
              <span className="font-medium text-sm">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function toPascalCase(kebab: string) {
  return kebab
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
