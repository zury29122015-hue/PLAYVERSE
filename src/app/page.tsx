import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { getHomeData } from "@/lib/queries";
import { GameRow } from "@/components/games/GameRow";
import { SetupNotice } from "@/components/SetupNotice";
import { CategoryGrid } from "@/components/games/CategoryGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data, dbError } = await getHomeData();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-pv-border/60">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight">
            Crea. Publica. <span className="pv-gradient-text">Juega.</span>
          </h1>
          <p className="mt-4 text-pv-muted max-w-2xl mx-auto text-base md:text-lg">
            PlayVerse es la plataforma donde cualquiera puede crear sus propios videojuegos — importando un proyecto,
            construyéndolo visualmente sin código, o programándolo desde cero — y compartirlos con el mundo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/create" className="pv-btn-primary px-7 py-3 rounded-full font-semibold flex items-center gap-2 justify-center shadow-glow animate-glowpulse">
              <Plus size={18} /> Crear videojuego
            </Link>
            <Link href="/explore" className="px-7 py-3 rounded-full font-semibold border border-pv-border hover:border-pv-purple flex items-center gap-2 justify-center">
              Explorar catálogo <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {dbError && <SetupNotice />}

      <CategoryGrid categories={data.categories} />

      <GameRow title="🏆 Destacados" games={data.featured} seeAllHref="/explore?sort=top" />
      <GameRow title="🔥 Juegos populares" games={data.popular} seeAllHref="/explore?sort=popular" />
      <GameRow title="🆕 Recién publicados" games={data.recent} seeAllHref="/explore?sort=new" />
      <GameRow title="✨ Recomendados para ti" games={data.recommended} seeAllHref="/explore" />
      <GameRow title="⭐ Mejor valorados" games={data.topRated} seeAllHref="/explore?sort=top" />
    </div>
  );
}
