import React, { useMemo } from "react";
import type { SceneryId, AppTheme } from "../../types/meanwhile";
import { SCENERY_INFO } from "../../lib/scenery-data";

interface SceneryBackgroundProps {
  scenery: SceneryId;
  theme: AppTheme;
  children: React.ReactNode;
}

export const SceneryBackground: React.FC<SceneryBackgroundProps> = ({
  scenery,
  theme,
  children,
}) => {
  const currentScene = SCENERY_INFO[scenery] || SCENERY_INFO["rainy-window"];
  const isDark = theme === "dark";

  // Ambient particle effects
  const ambientEffects = useMemo(() => {
    if (scenery === "rainy-window") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-10">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full w-[1.5px] ${
                isDark ? "bg-sky-200/70" : "bg-sky-400/70"
              }`}
              style={{
                left: `${(i * 3.7 + 2) % 98}%`,
                top: `${(i * 17) % 85}%`,
                height: `${14 + (i % 6) * 6}px`,
                animation: `rain-drop ${1.6 + (i % 5) * 0.35}s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (scenery === "starry-night") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60 z-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-amber-100 rounded-full animate-pulse-subtle shadow-[0_0_8px_rgba(254,243,199,0.8)]"
              style={{
                left: `${(i * 4.3 + 5) % 95}%`,
                top: `${(i * 8.5 + 4) % 65}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (scenery === "spring-garden") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-45 z-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-rose-300/70 rounded-full blur-[0.3px] animate-gentle-drift"
              style={{
                left: `${(i * 8.5 + 3) % 92}%`,
                top: `${(i * 11 + 8) % 75}%`,
                width: `${5 + (i % 3) * 2}px`,
                height: `${4 + (i % 2) * 2}px`,
                animationDuration: `${13 + i * 2}s`,
                animationDelay: `${i * 1.1}s`,
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  }, [scenery, isDark]);

  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden transition-colors duration-500 ${
        isDark ? "dark bg-[#1c1917] text-[#FAF8F5]" : "bg-[#F6F3EB] text-[#514A43]"
      } selection:bg-[#A8B7A0]/35`}
    >
      {/* Background illustrated artwork - vividly visible */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-[1.02]"
        style={{
          backgroundImage: `url(${currentScene.image})`,
          filter: isDark
            ? "brightness(0.68) saturate(1.15) contrast(1.05)"
            : "brightness(0.96) saturate(1.08) contrast(1.02)",
        }}
      />

      {/* Gentle ambient animation layer */}
      {ambientEffects}

      {/* Scenery tint overlay: gentle so scenery remains vibrant and visible */}
      <div
        className={`fixed inset-0 z-0 transition-colors duration-700 pointer-events-none ${
          isDark ? "bg-black/45 backdrop-blur-[0.5px]" : "bg-[#F6F3EB]/35 backdrop-blur-[0.5px]"
        }`}
      />

      {/* Content wrapper */}
      <div className="relative z-20 min-h-screen flex flex-col">{children}</div>
    </div>
  );
};
