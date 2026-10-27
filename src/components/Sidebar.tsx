"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  Clock,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Repeat,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Meu dia", icon: LayoutDashboard },
  { href: "/tasks", label: "Tarefas", icon: ListChecks },
  { href: "/routines", label: "Rotinas", icon: Repeat },
  { href: "/settings", label: "Expediente", icon: Clock },
  { href: "/review", label: "Revisão semanal", icon: CalendarCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand brand-small">
        <span className="brand-mark">MD</span>
        <strong>Marketplace Daily</strong>
      </div>

      <nav className="nav">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-box">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
        <button className="btn btn-ghost btn-block" onClick={handleLogout}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
}