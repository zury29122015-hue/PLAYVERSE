"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Gamepad2, LibraryBig, LogOut, Plus, Search, Settings, Shield, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : "/explore");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-pv-border/70 bg-pv-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-pv-purple to-pv-blue flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
            <Gamepad2 size={20} className="text-white" />
          </span>
          <span className="font-display font-extrabold text-lg tracking-tight hidden sm:inline pv-gradient-text">
            PLAYVERSE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-pv-muted shrink-0">
          <Link href="/explore" className="hover:text-white transition-colors">Explorar</Link>
          <Link href="/explore?sort=top" className="hover:text-white transition-colors">Mejor valorados</Link>
          <Link href="/explore?sort=new" className="hover:text-white transition-colors">Nuevos</Link>
        </nav>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pv-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar videojuegos..."
            className="w-full bg-pv-panel border border-pv-border rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-pv-purple transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          <Link
            href="/create"
            className="pv-btn-primary hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shadow-glow-sm"
          >
            <Plus size={16} /> Crear videojuego
          </Link>

          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-pv-panel2 border border-pv-border flex items-center justify-center overflow-hidden"
              >
                {session.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={16} />
                )}
              </button>
              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 pv-card rounded-xl shadow-glow p-2 text-sm"
                >
                  <div className="px-3 py-2 text-pv-muted truncate">@{session.user.username}</div>
                  <MenuLink href={`/profile/${session.user.username}`} icon={<UserIcon size={14} />}>Mi perfil</MenuLink>
                  <MenuLink href="/library" icon={<LibraryBig size={14} />}>Biblioteca</MenuLink>
                  <MenuLink href="/create" icon={<Plus size={14} />}>Crear videojuego</MenuLink>
                  <MenuLink href="/settings" icon={<Settings size={14} />}>Ajustes</MenuLink>
                  {session.user.role === "ADMIN" && (
                    <MenuLink href="/admin" icon={<Shield size={14} />}>Panel admin</MenuLink>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pv-panel2 text-red-400"
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm px-3 py-2 hover:text-white text-pv-muted">
                Entrar
              </Link>
              <Link href="/register" className="pv-btn-primary text-sm px-4 py-2 rounded-full font-semibold">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pv-panel2">
      {icon}
      {children}
    </Link>
  );
}
