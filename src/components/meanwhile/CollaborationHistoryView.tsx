import React from "react";
import { Users, Calendar, CheckCircle2, Clock, Sparkles } from "lucide-react";
import type { CollaborationHistoryRecord } from "../../types/meanwhile";

interface CollaborationHistoryViewProps {
  history: CollaborationHistoryRecord[];
  onOpenCollaborateModal: () => void;
  isDark: boolean;
}

export const CollaborationHistoryView: React.FC<CollaborationHistoryViewProps> = ({
  history,
  onOpenCollaborateModal,
  isDark,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-500/25 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#657B68] font-medium font-sans">
            Collaboration Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mt-1">
            People we've learned alongside
          </h1>
          <p className="text-xs sm:text-sm opacity-75 font-light mt-1">
            A quiet archive of companions who shared your study rooms, chapters read, and hours
            focused.
          </p>
        </div>

        <button
          onClick={onOpenCollaborateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#657B68] hover:bg-[#516354] text-white text-xs font-medium transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Invite New Collaborators</span>
        </button>
      </section>

      {/* History List */}
      <div className="flex flex-col gap-4">
        {history.length === 0 ? (
          <div
            className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
              isDark
                ? "bg-stone-900/60 border-stone-800"
                : "bg-white/70 border-[#A8B7A0]/30 shadow-xs"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#657B68]/15 text-[#657B68] flex items-center justify-center">
              <Users className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium">No collaboration history yet</h3>
            <p className="text-xs opacity-70 max-w-sm">
              Study spaces you create or join will appear here, recording who you collaborated with
              and what you accomplished together.
            </p>
            <button
              onClick={onOpenCollaborateModal}
              className="mt-2 px-5 py-2 rounded-xl bg-[#657B68] hover:bg-[#516354] text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
            >
              Start Your First Collaboration
            </button>
          </div>
        ) : (
          history.map((record) => (
            <div
              key={record.id}
              className={`p-6 rounded-3xl border flex flex-col gap-3 transition-all ${
                isDark
                  ? "bg-stone-900/80 border-stone-800"
                  : "bg-white/80 border-[#A8B7A0]/35 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-xl font-medium">{record.roomName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs opacity-70 flex items-center gap-1 font-light">
                      <Calendar className="w-3.5 h-3.5 text-[#657B68]" />
                      {new Date(record.startedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#657B68]/15 text-[#657B68]">
                      {record.roomCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-[#657B68] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {record.topicsCompletedTogether} topics completed
                  </span>
                  <span className="flex items-center gap-1 opacity-70">
                    <Clock className="w-3.5 h-3.5" />
                    {record.totalFocusMinutes}m focused
                  </span>
                </div>
              </div>

              {/* Collaborators List */}
              <div className="pt-3 border-t border-stone-500/15 flex items-center gap-2 flex-wrap">
                <span className="text-xs opacity-65 font-medium">Learners:</span>
                {record.collaborators.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#657B68]/10 border border-[#657B68]/20"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#657B68]" />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
