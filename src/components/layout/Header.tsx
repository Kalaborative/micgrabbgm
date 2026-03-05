"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push("/signin");
  };

  // Get initials from display name or email
  const displayName = user?.displayName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between border-b border-primary/20 bg-bg-dark/80 backdrop-blur-md px-6 py-4 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary/20 rounded-lg">
            <MaterialIcon icon="mic_external_on" className="text-primary text-2xl" />
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">Mic Grab BGM</h2>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl px-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MaterialIcon icon="search" className="text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            className="block w-full bg-primary/10 border-none rounded-xl py-2.5 pl-12 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 transition-all text-sm shadow-inner"
            placeholder="Search by lyrics, title, or artist..."
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <MaterialIcon icon="notifications" />
            </button>

            {/* User avatar + dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-10 w-10 rounded-full border-2 border-primary/30 bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors"
              >
                <span className="text-white text-sm font-bold">{initials}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-bg-dark border border-primary/20 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-primary/10">
                    <p className="font-semibold text-white text-sm truncate">{displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <MaterialIcon icon="logout" className="text-lg" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/signin"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm glow-button hover:bg-primary/90 transition-all"
          >
            <MaterialIcon icon="login" className="text-lg" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
