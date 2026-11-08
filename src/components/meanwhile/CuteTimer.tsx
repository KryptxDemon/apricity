import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Coffee } from "lucide-react";
import { ambientSound } from "../../lib/audio-ambient";
import { useMeanwhile } from "../../context/MeanwhileContext";
import { toast } from "sonner";

interface CuteTimerProps {
  isDark: boolean;
}

export const CuteTimer: React.FC<CuteTimerProps> = ({ isDark }) => {
  const { recordStudySession, currentUser, space } = useMeanwhile();

  const PRESETS = [
    { label: "15m", seconds: 15 * 60, title: "Tea Break" },
    { label: "25m", seconds: 25 * 60, title: "Focus" },
    { label: "50m", seconds: 50 * 60, title: "Deep Study" },
  ];

  const [selectedPreset, setSelectedPreset] = useState<number>(25 * 60);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const initialTimeRef = useRef<number>(25 * 60);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) {
              ambientSound.playChime();
            }
            const durationMins = Math.round(initialTimeRef.current / 60);
            recordStudySession(durationMins, currentUser?.currentSubject || "Study Focus");
            toast.success("Focus block finished! Well done. Take a cozy rest.", {
              description: `${durationMins} minutes studied together.`,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, soundEnabled, recordStudySession, currentUser]);

  const handleSelectPreset = (seconds: number) => {
    setIsRunning(false);
    setSelectedPreset(seconds);
    setTimeLeft(seconds);
    initialTimeRef.current = seconds;
  };

  const togglePlayPause = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedPreset);
      initialTimeRef.current = selectedPreset;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedPreset);
    initialTimeRef.current = selectedPreset;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = ((initialTimeRef.current - timeLeft) / initialTimeRef.current) * 100;

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        isDark
          ? "bg-[#1C1916]/65 border-white/10 text-white shadow-lg backdrop-blur-xl"
          : "bg-white/60 border-white/60 text-black shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Timer status & Presets */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
              isRunning ? "scale-105" : ""
            } ${isDark ? "bg-[#8EB391]/20 text-[#8EB391]" : "bg-[#2E4532]/10 text-[#2E4532]"}`}
          >
            <Coffee className={`w-5 h-5 ${isRunning ? "animate-pulse" : ""}`} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-black dark:text-white">
                Cozy Focus Clock
              </span>
              {isRunning && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  focusing
                </span>
              )}
            </div>

            {/* Presets pills */}
            <div className="flex items-center gap-1.5 mt-1">
              {PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  type="button"
                  onClick={() => handleSelectPreset(p.seconds)}
                  className={`px-2.5 py-0.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    selectedPreset === p.seconds
                      ? "bg-[#2E4532] text-white border-transparent dark:bg-[#8EB391] dark:text-black shadow-2xs"
                      : "bg-white/40 dark:bg-black/20 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-white/70"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Big digits & Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Time digits */}
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
            {formattedTime}
          </div>

          {/* Play / Pause button */}
          <button
            onClick={togglePlayPause}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isRunning
                ? "bg-amber-600/90 hover:bg-amber-700 text-white"
                : "bg-[#2E4532] dark:bg-[#8EB391] hover:opacity-90 text-white dark:text-black"
            }`}
            title={isRunning ? "Pause" : "Start Focus"}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-9 h-9 rounded-2xl bg-white/40 dark:bg-black/25 hover:bg-white/70 dark:hover:bg-black/40 border border-black/10 dark:border-white/10 flex items-center justify-center text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-2xl bg-white/40 dark:bg-black/25 hover:bg-white/70 dark:hover:bg-black/40 border border-black/10 dark:border-white/10 flex items-center justify-center text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            title={soundEnabled ? "Mute completion chime" : "Unmute completion chime"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-50" />
            )}
          </button>
        </div>
      </div>

      {/* Subtle progress line */}
      <div className="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className="bg-[#2E4532] dark:bg-[#8EB391] h-full transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
