import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES: { slug: string; name: string; icon: string; order: number }[] = [
  { slug: "accion", name: "Acción", icon: "sword", order: 1 },
  { slug: "aventura", name: "Aventura", icon: "compass", order: 2 },
  { slug: "terror", name: "Terror", icon: "ghost", order: 3 },
  { slug: "carreras", name: "Carreras", icon: "car", order: 4 },
  { slug: "plataformas", name: "Plataformas", icon: "blocks", order: 5 },
  { slug: "simulacion", name: "Simulación", icon: "settings", order: 6 },
  { slug: "deportes", name: "Deportes", icon: "trophy", order: 7 },
  { slug: "estrategia", name: "Estrategia", icon: "brain", order: 8 },
  { slug: "multijugador", name: "Multijugador", icon: "users", order: 9 },
  { slug: "puzzle", name: "Puzzle", icon: "puzzle", order: 10 },
];

async function main() {
  for (const category of CATEGORIES) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, icon: category.icon, order: category.order },
      create: category,
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
