import React, { useState } from "react";
import {
  BookOpen,
  Home,
  Clock,
  Settings,
  Bell,
  Sun,
  Moon,
  Plus,
  LogOut,
  Menu,
  X,
  History,
  Music,
  Compass,
} from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";
import type { AmbientSoundTrack } from "../../types/meanwhile";

export type ActiveTab = "home" | "my-notebook" | "history" | "quiet-room" | "settings";

interface NavigationRailProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenPokeModal: () => void;
  onOpenCollaborateModal: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  onSelectTab,
  onOpenPokeModal,
  onOpenCollaborateModal,
}) => {
  const {
    currentUser,
    collaborators,
    myUnreadPokes,
    theme,
    toggleTheme,
    bgMusic,
    setBgMusic,
    logoutUser,
  } = useMeanwhile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === "dark";

  // Removed "collaborators" tab from sidebar as requested
  const navItems = [
    { id: "home", label: "My Tasks & Space", icon: Home },
    { id: "my-notebook", label: "Notebook & Chapters", icon: BookOpen },
    { id: "history", label: "Collab History", icon: History },
    { id: "quiet-room", label: "Quiet Room", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const handleNav = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const musicTracks: { id: AmbientSoundTrack; label: string }[] = [
    { id: "none", label: "Off" },
    { id: "rain", label: "Rain" },
    { id: "library", label: "Library" },
    { id: "cafe", label: "Café" },
    { id: "night", label: "Night" },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header
        className={`lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 border-b transition-colors backdrop-blur-md ${
          isDark
            ? "bg-[#1E1B18]/95 border-stone-800 text-[#F5F3EF]"
            : "bg-white/95 border-black/15 text-black shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Sun icon for apricity (warmth of the sun in winter), no sparkles */}
          <div className="w-9 h-9 rounded-2xl bg-[#38513C] dark:bg-[#7FA382] flex items-center justify-center text-white dark:text-black font-bold shadow-xs">
            <Sun className="w-5 h-5 stroke-[2.25]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-black dark:text-white">
            apricity
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Collaborate + icon button */}
          <button
            onClick={onOpenCollaborateModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black text-xs font-bold shadow-xs cursor-pointer"
            title="Collaborate (Up to 10)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Collab</span>
          </button>

          {/* Theme switch */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-black/15 dark:border-white/15 cursor-pointer"
            title={isDark ? "Switch to Cozy Paper" : "Switch to Cozy Dark"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-black" />
            )}
          </button>

          {/* Poke indicator */}
          {myUnreadPokes.length > 0 && (
            <button
              onClick={onOpenPokeModal}
              className="relative p-2 rounded-full bg-rose-500/20 text-rose-500"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-black dark:text-white"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden fixed inset-x-0 top-[60px] bottom-0 z-30 p-5 flex flex-col justify-between backdrop-blur-xl border-b animate-in fade-in ${
            isDark
              ? "bg-[#1E1B18]/98 border-stone-800 text-white"
              : "bg-white/98 border-black/15 text-black"
          }`}
        >
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-base font-medium transition-all ${
                    isActive
                      ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black font-bold shadow-xs"
                      : "text-black dark:text-white hover:bg-stone-500/10"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-3">
            {/* Background Music Selector for everyone */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-black/70 dark:text-white/70 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                Background Sound
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {musicTracks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBgMusic(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      bgMusic === t.id
                        ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black border-transparent"
                        : "bg-stone-500/10 border-stone-500/20 text-black dark:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={logoutUser}
              className="flex items-center justify-center gap-2 py-2 text-sm text-rose-600 font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation Rail */}
      <aside
        className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 h-screen sticky top-0 p-6 shrink-0 z-30 select-none border-r backdrop-blur-md transition-colors ${
          isDark
            ? "bg-[#1E1B18]/90 border-stone-800 text-[#F5F3EF]"
            : "bg-white/92 border-black/15 text-black"
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Wordmark & Theme Switch - Warm sun motif, no sparkles */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#38513C] dark:bg-[#7FA382] flex items-center justify-center text-white dark:text-black shadow-xs">
                <Sun className="w-5 h-5 stroke-[2.25]" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight leading-none text-black dark:text-white">
                  apricity
                </h1>
                <p className="text-xs font-medium text-black/60 dark:text-white/60 mt-1">
                  the sun in winter
                </p>
              </div>
            </div>

            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isDark
                  ? "bg-stone-800 text-amber-300 border-stone-700 hover:bg-stone-700"
                  : "bg-white text-black border-black/20 hover:bg-stone-100 shadow-2xs"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-sm transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-[#141311] font-bold shadow-xs"
                      : isDark
                        ? "text-stone-300 hover:bg-stone-800 hover:text-white font-medium"
                        : "text-black hover:bg-black/5 font-semibold"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-white dark:text-black" : "text-[#38513C] dark:text-[#7FA382]"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Everyone Can Change Background Music */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
              isDark
                ? "bg-stone-900/60 border-stone-800 text-stone-200"
                : "bg-[#F7F5EE] border-black/10 text-black shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                Ambient Sound
              </span>
              <span className="text-[11px] font-semibold text-[#38513C] dark:text-[#7FA382] capitalize">
                {bgMusic === "none" ? "Muted" : bgMusic}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 pt-1">
              {musicTracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBgMusic(t.id)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-all border text-center ${
                    bgMusic === t.id
                      ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black border-transparent"
                      : "bg-white dark:bg-stone-800 border-black/10 dark:border-stone-700 text-black dark:text-white hover:opacity-80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="flex flex-col gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          {myUnreadPokes.length > 0 && (
            <button
              onClick={onOpenPokeModal}
              className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-500/25 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>You have a nudge</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </button>
          )}

          {currentUser && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-stone-900 border-stone-800" : "bg-white border-black/15 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#38513C]/15 dark:bg-[#7FA382]/20 text-[#38513C] dark:text-[#7FA382] flex items-center justify-center font-serif text-sm font-bold shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-black dark:text-white truncate leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-black/60 dark:text-white/60 truncate mt-0.5">
                    {currentUser.currentSubject || "Studying"}
                  </p>
                </div>
              </div>

              <button
                onClick={logoutUser}
                className="p-1.5 rounded-lg text-black/50 dark:text-white/50 hover:text-rose-600 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
