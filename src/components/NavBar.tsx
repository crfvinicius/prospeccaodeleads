import Link from "next/link";

const LINKS = [
  { href: "/", label: "Kanban" },
  { href: "/buscar", label: "Buscar leads" },
  { href: "/upload", label: "Upload" },
  { href: "/whatsapp", label: "WhatsApp" },
];

export function NavBar() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <span className="font-semibold">Prospecção de Leads</span>
        <div className="flex gap-3 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
