import React, { useState } from "react";
import {
  Image,
  User,
  Users,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";
import { SCENERY_INFO } from "../../lib/scenery-data";
import type { SceneryId } from "../../types/meanwhile";
import { toast } from "sonner";

export const SettingsView: React.FC = () => {
  const { currentUser, updateCurrentUser, setScenery, space, theme, toggleTheme, logoutUser } =
    useMeanwhile();

  const isDark = theme === "dark";

  // Profile form
  const [name, setName] = useState(currentUser?.name || "");
  const [currentSubject, setCurrentSubject] = useState(currentUser?.currentSubject || "");
  const [avatarSeed, setAvatarSeed] = useState(currentUser?.avatarSeed || "leaf");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateCurrentUser({
      name: name.trim(),
      currentSubject: currentSubject.trim(),
      avatarSeed,
    });
    toast.success("Profile settings updated");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(space.code);
    setCopiedCode(true);
    toast.success("Room code copied: " + space.code);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-10">
      {/* Title */}
      <section className="flex flex-col gap-1 border-b border-stone-500/20 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#657B68] font-medium font-sans">
          Settings & Environment
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Personalize your little space
        </h1>
        <p className="text-xs sm:text-sm opacity-75 font-light mt-1">
          Adjust theme, select ambient scenery, or manage your study profile.
        </p>
      </section>

      {/* Cozy Theme Switch */}
      <section
        className={`p-6 sm:p-7 rounded-3xl border flex items-center justify-between ${
          isDark
            ? "bg-stone-900/80 border-stone-800 text-stone-100"
            : "bg-white/85 border-[#A8B7A0]/40 text-[#514A43] shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#657B68]/15 text-[#657B68] flex items-center justify-center">
            {isDark ? <Moon className="w-5 h-5 text-amber-300" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-serif text-lg font-medium">Appearance & Tone</h2>
            <p className="text-xs opacity-70 font-light">
              Current: {isDark ? "Cozy Midnight Hearth (Dark)" : "Cozy Warm Paper (Light)"}
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 border ${
            isDark
              ? "bg-stone-800 text-amber-300 border-stone-700 hover:bg-stone-700"
              : "bg-white text-[#514A43] border-[#A8B7A0]/40 hover:bg-[#A8B7A0]/20 shadow-2xs"
          }`}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[#657B68]" />
          )}
          <span>Switch to {isDark ? "Warm Paper" : "Midnight Hearth"}</span>
        </button>
      </section>

      {/* Scenery Selector */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-[#657B68]" />
          <h2 className="font-serif text-2xl font-normal">Background Scenery</h2>
        </div>
        <p className="text-xs opacity-70 font-light">
          Choose an illustrated atmosphere that sets the tone for your study sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.keys(SCENERY_INFO) as SceneryId[]).map((key) => {
            const scene = SCENERY_INFO[key];
            const isSelected = currentUser?.scenery === key;
            return (
              <div
                key={key}
                onClick={() => {
                  setScenery(key);
                  toast.success(`Atmosphere changed to ${scene.name}`);
                }}
                className={`group relative overflow-hidden rounded-3xl border-2 transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? "border-[#657B68] ring-2 ring-[#657B68]/30 shadow-md"
                    : "border-stone-500/25 hover:border-[#657B68]/60 hover:shadow-sm"
                }`}
              >
                <div
                  className="h-32 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${scene.image})` }}
                />
                <div
                  className={`p-3.5 backdrop-blur-xs flex items-center justify-between ${
                    isDark ? "bg-stone-900/90 text-stone-100" : "bg-white/90 text-[#514A43]"
                  }`}
                >
                  <div>
                    <h3 className="font-serif text-sm font-medium">{scene.name}</h3>
                    <p className="text-[10px] opacity-70 truncate max-w-[170px]">
                      {scene.subtitle}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#657B68] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Profile Details */}
      <section
        className={`flex flex-col gap-4 p-6 sm:p-7 rounded-3xl border ${
          isDark
            ? "bg-stone-900/80 border-stone-800 text-stone-100"
            : "bg-white/85 border-[#A8B7A0]/40 text-[#514A43] shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#657B68]" />
          <h2 className="font-serif text-xl font-normal">Your Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-80">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                  isDark
                    ? "bg-stone-800 border-stone-700 text-stone-100"
                    : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-80">Current Study Focus</label>
              <input
                type="text"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                placeholder="e.g. Distributed Systems, Organic Chemistry"
                className={`px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                  isDark
                    ? "bg-stone-800 border-stone-700 text-stone-100"
                    : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#657B68] hover:bg-[#516354] text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* Sign Out */}
      <section className="flex justify-between items-center pt-4 border-t border-stone-500/20">
        <span className="text-xs opacity-60">Ready to step away from your study room?</span>
        <button
          onClick={logoutUser}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </section>
    </div>
  );
};
