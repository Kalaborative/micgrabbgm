"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  view: "all" | "mine";
  onViewChange: (view: "all" | "mine") => void;
}

export default function Sidebar({ view, onViewChange }: SidebarProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } border-r border-primary/10 flex flex-col py-8 px-2 bg-bg-dark/50 transition-all duration-200`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center size-10 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors mb-4 self-center"
      >
        <MaterialIcon icon={collapsed ? "menu" : "menu_open"} />
      </button>

      <nav className="flex flex-col gap-2">
        <button
          onClick={() => onViewChange("all")}
          title="Latest Tracks"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
            collapsed ? "justify-center" : ""
          } ${
            view === "all"
              ? "bg-primary/20 text-primary font-semibold"
              : "text-slate-400 hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <MaterialIcon icon="library_music" />
          {!collapsed && <span>Latest Tracks</span>}
        </button>
        {user && (
          <>
            <button
              onClick={() => onViewChange("mine")}
              title="My Library"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                collapsed ? "justify-center" : ""
              } ${
                view === "mine"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-slate-400 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <MaterialIcon icon="person" />
              {!collapsed && <span>My Library</span>}
            </button>
            <Link
              href="/editor/new"
              title="Upload Track"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <MaterialIcon icon="cloud_upload" />
              {!collapsed && <span>Upload Track</span>}
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
