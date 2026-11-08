import React, { useState } from "react";
import { Sparkles, BookOpen, Clock, MessageSquare, Heart, Calendar, Users } from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";

export const LittleJournalView: React.FC = () => {
  const { activity, currentUser, theme } = useMeanwhile();
  const [filter, setFilter] = useState<"all" | "topics" | "sessions" | "notes">("all");
  const isDark = theme === "dark";

  const filteredEvents = activity.filter((item) => {
    if (filter === "topics") return item.kind === "topic_completed";
    if (filter === "sessions") return item.kind === "session_completed";
    if (filter === "notes") return item.kind === "note_added";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8">
      {/* Editorial Header */}
      <section className="flex flex-col gap-1.5 border-b border-stone-500/20 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#657B68] font-medium font-sans">
          Shared Journal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          A chronicle of our studies
        </h1>
        <p className="text-xs sm:text-sm opacity-70 font-light mt-1">
          A quiet chronicle of chapters read, topics understood, and words exchanged across the
          distance.
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto">
          {(["all", "topics", "sessions", "notes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer border ${
                filter === tab
                  ? "bg-[#657B68] text-white border-[#657B68] shadow-2xs"
                  : isDark
                    ? "bg-stone-800/80 border-stone-700 text-stone-200 hover:bg-stone-800"
                    : "bg-white/80 border-[#A8B7A0]/30 hover:bg-white text-[#514A43]"
              }`}
            >
              {tab === "all"
                ? "All moments"
                : tab === "topics"
                  ? "Completed topics"
                  : tab === "sessions"
                    ? "Focus sessions"
                    : "Little notes"}
            </button>
          ))}
        </div>
      </section>

      {/* Chronicle List */}
      <div className="flex flex-col gap-4">
        {filteredEvents.length === 0 ? (
          <div
            className={`p-12 text-center rounded-3xl border ${
              isDark
                ? "bg-stone-900/60 border-stone-800"
                : "bg-white/80 border-[#A8B7A0]/30 shadow-xs"
            }`}
          >
            <Calendar className="w-8 h-8 text-[#A8B7A0] mx-auto mb-2" />
            <p className="font-serif text-lg">The journal rests quietly today.</p>
            <p className="text-xs opacity-60 mt-1">
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
                  : "bg-white/85 border-[#A8B7A0]/35 text-[#514A43] shadow-xs"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  event.kind === "topic_completed"
                    ? "bg-[#657B68]/20 text-[#657B68]"
                    : event.kind === "session_completed"
                      ? "bg-[#A8BBCB]/25 text-[#A8BBCB]"
                      : event.kind === "collaborator_joined"
                        ? "bg-[#657B68]/20 text-[#657B68]"
                        : event.kind === "note_added"
                          ? "bg-[#E8C9B9]/35 text-amber-600 dark:text-amber-300"
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
                    <span className="font-serif text-base font-medium">{event.ownerName}</span>
                    <span className="text-[11px] opacity-60 font-light">{event.subjectName}</span>
                  </div>
                  <span className="text-[10px] opacity-50">
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

                <p className="font-serif text-base sm:text-lg leading-relaxed">{event.detail}</p>
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
            : "bg-[#F6F3EB]/90 border-[#A8B7A0]/35 text-[#514A43]"
        }`}
      >
        <p className="font-serif italic text-base">"A little progress, in two different worlds."</p>
      </section>
    </div>
  );
};
