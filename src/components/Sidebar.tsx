"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Upload,
  MessageCircle,
  Megaphone,
  Target,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Kanban", icon: LayoutDashboard },
  { href: "/buscar", label: "Buscar leads", icon: Search },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/campanhas", label: "Campanhas", icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-black/10 bg-white dark:border-white/10 dark:bg-neutral-950">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Target size={18} />
        </div>
        <span className="font-semibold">Prospecção</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
