import React, { useState } from "react";
import { Sun, User, Lock, Mail, ArrowRight } from "lucide-react";
import type { UserProfile } from "../../types/meanwhile";

interface AuthModalProps {
  onLogin: (user: UserProfile) => void;
  theme: "light" | "dark";
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, theme }) => {
  const [tab, setTab] = useState<"signin" | "signup" | "guest">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarSeed, setAvatarSeed] = useState<UserProfile["avatarSeed"]>("leaf");
  const [currentSubject, setCurrentSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === "dark";

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      const derivedName = name.trim() || email.split("@")[0] || "Learner";
      const user: UserProfile = {
        id: `user-${Date.now()}`,
        name: derivedName,
        email: email.trim(),
        avatarSeed,
        currentSubject: currentSubject.trim() || "General Study",
        presence: "studying",
        scenery: "rainy-window",
      };
      setIsLoading(false);
      onLogin(user);
    }, 350);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      const user: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        avatarSeed,
        currentSubject: currentSubject.trim() || "General Study",
        presence: "studying",
        scenery: "rainy-window",
      };
      setIsLoading(false);
      onLogin(user);
    }, 350);
  };

  const handleGuestEnter = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || "Learner";
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: cleanName,
      avatarSeed,
      currentSubject: currentSubject.trim() || "General Study",
      presence: "studying",
      scenery: "rainy-window",
    };
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
          isDark
            ? "bg-[#1E1B18]/98 border-stone-800 text-[#F5F3EF]"
            : "bg-white border-black/20 text-black"
        }`}
      >
        {/* Brand Header - apricity (sun icon, no sparkles) */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#38513C] dark:bg-[#7FA382] flex items-center justify-center text-white dark:text-black font-bold shadow-xs">
            <Sun className="w-7 h-7 stroke-[2.25]" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-black dark:text-white mt-1">
            apricity
          </h2>
          <p className="text-xs font-semibold text-black/70 dark:text-white/70 max-w-xs">
            the warmth of the sun in winter
          </p>
        </div>

        {/* Tab selection */}
        <div
          className={`flex rounded-2xl p-1 mb-6 border ${
            isDark ? "bg-stone-900 border-stone-800" : "bg-stone-100 border-black/15"
          }`}
        >
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === "signin"
                ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black shadow-xs"
                : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === "signup"
                ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black shadow-xs"
                : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
            }`}
          >
            Create Space
          </button>
          <button
            type="button"
            onClick={() => setTab("guest")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === "guest"
                ? "bg-[#38513C] dark:bg-[#7FA382] text-white dark:text-black shadow-xs"
                : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
            }`}
          >
            Guest Pass
          </button>
        </div>

        {/* Sign In Form */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                Email address
              </label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-stone-50 border-black/25 text-black font-semibold"
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-stone-50 border-black/25 text-black font-semibold"
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-xl bg-[#38513C] dark:bg-[#7FA382] hover:opacity-90 text-white dark:text-black text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isLoading ? "Signing in..." : "Enter apricity"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === "signup" && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                Your Name
              </label>
              <input
                type="text"
                placeholder="Your full name or nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-stone-50 border-black/25 text-black font-semibold"
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                Email address
              </label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-stone-50 border-black/25 text-black font-semibold"
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-stone-50 border-black/25 text-black font-semibold"
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-xl bg-[#38513C] dark:bg-[#7FA382] hover:opacity-90 text-white dark:text-black text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isLoading ? "Creating space..." : "Create Account & Start"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Guest Form */}
        {tab === "guest" && (
          <form onSubmit={handleGuestEnter} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black/80 dark:text-white/80 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#38513C] dark:text-[#7FA382]" />
                What should we call you?
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-stone-50 border-black/25 text-black font-semibold"
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black/80 dark:text-white/80">
                Your main subject or goal
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Architecture"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#38513C] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-stone-50 border-black/25 text-black font-semibold"
                }`}
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 rounded-xl bg-[#38513C] dark:bg-[#7FA382] hover:opacity-90 text-white dark:text-black text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Start as Guest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
