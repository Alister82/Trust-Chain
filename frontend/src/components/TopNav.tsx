"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function TopNav() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <nav className="fixed top-0 right-0 p-6 z-[100] flex items-center space-x-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center bg-white/70 dark:bg-black/70 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)] border border-black/5 dark:border-white/10 px-3 py-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {mounted ? (
            resolvedTheme === "dark" ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-black" />
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>
        
        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-2" />

        <button
          className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <UserCircle className="w-6 h-6 text-black dark:text-white" />
          <span className="text-sm font-medium text-black dark:text-white">Profile</span>
        </button>
      </div>
    </nav>
  );
}
