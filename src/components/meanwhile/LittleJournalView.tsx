import React, { useState } from "react";
import { BookOpen, Clock, MessageSquare, Heart, Calendar, Users } from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";

export const LittleJournalView: React.FC = () => {
  const { activity, theme } = useMeanwhile();
  const [filter, setFilter] = useState<"all" | "topics" | "sessions" | "notes">("all");
  const isDark = theme === "dark";

  const filteredEvents = activity.filter((item) => {
    if (filter === "topics") return item.kind === "topic_completed";
    if (filter === "sessions") return item.kind === "session_completed";
    if (filter === "notes") return item.kind === "note_added";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 text-black dark:text-[#F8F6F2]">
      {/* Editorial Header */}
      <section className="flex flex-col gap-1.5 border-b border-black/15 dark:border-white/15 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#2E4532] dark:text-[#8EB391] font-bold font-sans">
          Shared Journal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-black dark:text-[#F8F6F2]">
          A chronicle of our studies
        </h1>
        <p className="text-xs sm:text-sm text-black/75 dark:text-white/75 font-medium mt-1">
          A chronicle of chapters read, topics understood, and milestones shared across our study
          sessions.
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto">
          {(["all", "topics", "sessions", "notes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                filter === tab
                  ? "bg-[#2E4532] text-white border-[#2E4532] shadow-2xs dark:bg-[#8EB391] dark:text-black dark:border-[#8EB391]"
                  : isDark
                    ? "bg-stone-800/80 border-stone-700 text-stone-200 hover:bg-stone-800"
                    : "bg-white border-black/15 hover:bg-stone-100 text-black"
              }`}
            >
              {tab === "all"
                ? "All moments"
                : tab === "topics"
                  ? "Completed topics"
                  : tab === "sessions"
                    ? "Focus sessions"
                    : "Notes"}
            </button>
          ))}
        </div>
      </section>

      {/* Chronicle List */}
      <div className="flex flex-col gap-4">
        {filteredEvents.length === 0 ? (
          <div
            className={`p-12 text-center rounded-3xl border ${
              isDark ? "bg-stone-900/60 border-stone-800" : "bg-white/80 border-black/15 shadow-xs"
            }`}
          >
            <Calendar className="w-8 h-8 text-[#2E4532] dark:text-[#8EB391] mx-auto mb-2" />
            <p className="font-serif text-xl font-medium text-black dark:text-white">
              The journal has no entries yet today.
            </p>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1">
              Cross off a topic or finish a study session to add a line to this shared notebook.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`relative p-5 sm:p-6 rounded-3xl border flex items-start gap-4 transition-all ${
                isDark
                  ? "bg-stone-900/85 border-stone-800 text-stone-100"
                  : "bg-white border-black/15 text-black shadow-xs"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  event.kind === "topic_completed"
                    ? "bg-[#2E4532]/20 text-[#2E4532] dark:text-[#8EB391]"
                    : event.kind === "session_completed"
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      : event.kind === "collaborator_joined"
                        ? "bg-[#2E4532]/20 text-[#2E4532] dark:text-[#8EB391]"
                        : event.kind === "note_added"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : "bg-rose-500/15 text-rose-500"
                }`}
              >
                {event.kind === "topic_completed" ? (
                  <BookOpen className="w-5 h-5" />
                ) : event.kind === "session_completed" ? (
                  <Clock className="w-5 h-5" />
                ) : event.kind === "collaborator_joined" ? (
                  <Users className="w-5 h-5" />
                ) : event.kind === "note_added" ? (
                  <MessageSquare className="w-5 h-5" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-bold text-black dark:text-white">
                      {event.ownerName}
                    </span>
                    <span className="text-xs text-black/60 dark:text-white/60 font-medium">
                      {event.subjectName}
                    </span>
                  </div>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {new Date(event.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(event.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="font-serif text-base sm:text-lg leading-relaxed text-black dark:text-white">
                  {event.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quote */}
      <section
        className={`p-6 rounded-3xl border text-center ${
          isDark
            ? "bg-stone-900/60 border-stone-800 text-stone-300"
            : "bg-white border-black/15 text-black shadow-xs"
        }`}
      >
        <p className="font-serif italic text-base">"A little progress, in two different worlds."</p>
      </section>
    </div>
  );
};
