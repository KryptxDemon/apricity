import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume1,
  Volume2,
  Sparkles,
  Users,
} from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";
import { ambientSound } from "../../lib/audio-ambient";

export const QuietRoomView: React.FC = () => {
  const { currentUser, collaborators, subjects, recordStudySession, theme } = useMeanwhile();

  const isDark = theme === "dark";

  // Timer state
  const [selectedPresetMinutes, setSelectedPresetMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Subject and topic selection
  const userSubjects = subjects.filter((s) => s.ownerId === currentUser?.id);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(
    currentUser?.currentSubject || userSubjects[0]?.name || "Quiet Study",
  );
  const [selectedTopicName, setSelectedTopicName] = useState<string>("");

  // Ambient sound state
  const [soundType, setSoundType] = useState<"rain" | "library" | "night" | "none">("none");
  const [volume, setVolume] = useState<number>(0.35);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    ambientSound.play(soundType);
    return () => {
      ambientSound.stop();
    };
  }, [soundType]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  useEffect(() => {
    if (isActive && timeLeftSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && isActive) {
      setIsActive(false);
      setSessionCompleted(true);
      recordStudySession(selectedPresetMinutes, selectedSubjectName, selectedTopicName);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isActive,
    timeLeftSeconds,
    selectedPresetMinutes,
    selectedSubjectName,
    selectedTopicName,
    recordStudySession,
  ]);

  const handleSelectPreset = (minutes: number) => {
    setIsActive(false);
    setSelectedPresetMinutes(minutes);
    setTimeLeftSeconds(minutes * 60);
    setSessionCompleted(false);
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
    setSessionCompleted(false);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setTimeLeftSeconds(selectedPresetMinutes * 60);
    setSessionCompleted(false);
  };

  const handleCompleteEarly = () => {
    const elapsedMinutes = Math.max(
      1,
      Math.round((selectedPresetMinutes * 60 - timeLeftSeconds) / 60),
    );
    setIsActive(false);
    setSessionCompleted(true);
    recordStudySession(elapsedMinutes, selectedSubjectName, selectedTopicName);
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progressFraction = 1 - timeLeftSeconds / (selectedPresetMinutes * 60);
  const otherCollaborators = collaborators.filter((c) => c.id !== currentUser?.id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col items-center gap-8">
      {/* Title */}
      <div className="text-center flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-[#657B68] font-medium font-sans">
          Quiet Room
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          A calm place to focus
        </h1>
        <p className="text-xs sm:text-sm opacity-70 font-light max-w-md">
          Step away from noise. Let time unfold gently as you study together from afar.
        </p>

        {/* Collaborators presence in room */}
        {otherCollaborators.length > 0 && (
          <div
            className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs shadow-2xs backdrop-blur-xs ${
              isDark
                ? "bg-stone-900/80 border-stone-800 text-stone-200"
                : "bg-white/80 border-[#A8B7A0]/35 text-[#514A43]"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#657B68]" />
            <span className="font-light">
              Focusing alongside{" "}
              <strong className="font-medium">
                {otherCollaborators.map((c) => c.name).join(", ")}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Focus Timer Card */}
      <div
        className={`w-full max-w-lg p-8 sm:p-10 rounded-3xl border shadow-xs backdrop-blur-md flex flex-col items-center gap-8 ${
          isDark
            ? "bg-stone-900/85 border-stone-800 text-stone-100"
            : "bg-white/85 border-[#A8B7A0]/40 text-[#514A43]"
        }`}
      >
        {/* Preset Selector */}
        <div className="flex items-center gap-2 bg-stone-500/10 p-1 rounded-2xl border border-stone-500/20">
          {[15, 25, 50].map((m) => (
            <button
              key={m}
              onClick={() => handleSelectPreset(m)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedPresetMinutes === m
                  ? "bg-[#657B68] text-white shadow-xs"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        {/* Dial / Circular Time Display */}
        <div className="relative flex flex-col items-center justify-center w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-stone-500/15 bg-stone-500/5 shadow-inner">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="text-stone-400/20 stroke-current"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="text-[#657B68] stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="4"
              strokeDasharray="290"
              strokeDashoffset={290 * (1 - progressFraction)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <span className="font-serif text-5xl sm:text-6xl font-normal tracking-wider select-none">
            {formattedTime}
          </span>
          <span className="text-xs opacity-60 font-light mt-1 select-none">
            {isActive
              ? "focusing quietly"
              : sessionCompleted
                ? "session complete"
                : "ready to begin"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleResetTimer}
            className="p-3 rounded-2xl opacity-70 hover:opacity-100 hover:bg-stone-500/15 transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleTimer}
            className={`px-7 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium transition-all cursor-pointer shadow-sm ${
              isActive
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-[#657B68] hover:bg-[#516354] text-white"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Focus</span>
              </>
            )}
          </button>

          {isActive && (
            <button
              onClick={handleCompleteEarly}
              className="p-3 rounded-2xl text-[#657B68] hover:bg-[#657B68]/15 transition-colors cursor-pointer"
              title="Finish session early"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Topic Focus Selector */}
        <div className="w-full flex flex-col gap-2 pt-4 border-t border-stone-500/20">
          <span className="text-xs opacity-70 font-medium">Focus subject:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={selectedSubjectName}
              onChange={(e) => setSelectedSubjectName(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                isDark
                  ? "bg-stone-800 border-stone-700 text-stone-100"
                  : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
              }`}
            >
              {userSubjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="General Focus">General Focus</option>
            </select>

            <input
              type="text"
              placeholder="Topic name (optional)"
              value={selectedTopicName}
              onChange={(e) => setSelectedTopicName(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                isDark
                  ? "bg-stone-800 border-stone-700 text-stone-100"
                  : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
              }`}
            />
          </div>
        </div>

        {/* Ambient Synthesizer Controls */}
        <div className="w-full flex flex-col gap-2.5 pt-4 border-t border-stone-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-70 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#657B68]" />
              Ambient sound
            </span>
            <div className="flex items-center gap-1">
              {(["none", "rain", "library", "night"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSoundType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition-colors cursor-pointer ${
                    soundType === t
                      ? "bg-[#657B68] text-white font-medium"
                      : "opacity-70 hover:opacity-100 hover:bg-stone-500/10"
                  }`}
                >
                  {t === "none" ? "Off" : t}
                </button>
              ))}
            </div>
          </div>

          {soundType !== "none" && (
            <div className="flex items-center gap-3 px-2 pt-1">
              <Volume1 className="w-3.5 h-3.5 opacity-50" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[#657B68] h-1.5 bg-stone-500/30 rounded-lg cursor-pointer"
              />
              <Volume2 className="w-3.5 h-3.5 opacity-50" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
