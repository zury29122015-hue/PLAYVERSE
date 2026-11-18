import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-pv-border/70 mt-16 py-8 text-sm text-pv-muted">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <span className="font-display font-bold pv-gradient-text">PLAYVERSE</span>
          <p className="mt-1">CREATE. PUBLISH. PLAY.</p>
        </div>
        <div className="flex gap-6">
          <Link href="/explore" className="hover:text-white">Explorar</Link>
          <Link href="/create" className="hover:text-white">Crear</Link>
        </div>
      </div>
    </footer>
  );
}
