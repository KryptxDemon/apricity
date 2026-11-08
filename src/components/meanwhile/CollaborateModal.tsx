import React, { useState } from "react";
import { Users, UserPlus, Copy, Check, X, Trash2, Quote, Edit2 } from "lucide-react";
import type { CollaborationSpace, AuthorQuote } from "../../types/meanwhile";
import { FAMOUS_AUTHOR_QUOTES } from "../../lib/initial-data";
import { toast } from "sonner";

interface CollaborateModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CollaborationSpace;
  isHost: boolean;
  onAddCollaborator: (name: string, subject?: string) => void;
  onKickCollaborator: (id: string) => void;
  onRenameSpace: (name: string) => void;
  onSetSpaceQuote: (quote: AuthorQuote) => void;
  onDiminishSpace: () => void;
  onJoinSpaceByCode: (code: string) => void;
  isDark: boolean;
}

export const CollaborateModal: React.FC<CollaborateModalProps> = ({
  isOpen,
  onClose,
  space,
  isHost,
  onAddCollaborator,
  onKickCollaborator,
  onRenameSpace,
  onSetSpaceQuote,
  onDiminishSpace,
  onJoinSpaceByCode,
  isDark,
}) => {
  const [newCompanionName, setNewCompanionName] = useState("");
  const [newCompanionSubject, setNewCompanionSubject] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [spaceNameInput, setSpaceNameInput] = useState(space.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(space.code);
    setCopied(true);
    toast.success("Room code copied: " + space.code);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanionName.trim()) return;
    if (space.members.length >= 10) {
      toast.error("This space has reached the maximum of 10 collaborators.");
      return;
    }
    onAddCollaborator(newCompanionName.trim(), newCompanionSubject.trim());
    setNewCompanionName("");
    setNewCompanionSubject("");
    // Close modal immediately after adding as requested
    onClose();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    onJoinSpaceByCode(joinCodeInput.trim());
    setJoinCodeInput("");
    // Close modal immediately after joining as requested
    onClose();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceNameInput.trim()) return;
    onRenameSpace(spaceNameInput.trim());
    setIsEditingName(false);
  };

  const maxSlots = 10;
  const emptySlotsCount = maxSlots - space.members.length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border flex flex-col gap-6 max-h-[90vh] overflow-y-auto ${
          isDark
            ? "bg-[#1E1B18] border-stone-800 text-[#F5F3EF]"
            : "bg-[#F7F5EE] border-black/20 text-black"
        }`}
      >
        {/* Header with Title and Leader Controls */}
        <div className="flex items-start justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {isEditingName && isHost ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spaceNameInput}
                    onChange={(e) => setSpaceNameInput(e.target.value)}
                    className="px-3 py-1.5 text-lg font-serif rounded-xl border border-black/20 bg-white text-black"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#2E4532] text-white text-xs font-bold rounded-xl"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
                    {space.name}
                  </h3>
                  {isHost && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
                      title="Rename Space (Leader)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-black/70 dark:text-white/70">
              Room Code: <strong className="font-mono">{space.code}</strong> •{" "}
              {space.members.length} of 10 collaborators
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Motivation Author Quote by Leader */}
        <div
          className={`p-4 rounded-2xl border flex flex-col gap-2 ${
            isDark ? "bg-stone-900 border-stone-800" : "bg-white border-black/15 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-black/70 dark:text-white/70 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-[#2E4532] dark:text-[#8EB391]" />
              Study Room Motivation (Set by Leader)
            </span>
            {isHost && (
              <span className="text-[11px] font-bold text-[#2E4532] dark:text-[#8EB391]">
                Leader Controls
              </span>
            )}
          </div>

          <p className="font-serif text-base italic text-black dark:text-white">
            "{space.quote.text}"
          </p>
          <p className="text-xs font-bold text-black/60 dark:text-white/60">
            — {space.quote.author}
          </p>

          {isHost && (
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-black/60 dark:text-white/60 mr-1">
                Pick author:
              </span>
              {FAMOUS_AUTHOR_QUOTES.map((q) => (
                <button
                  key={q.author}
                  onClick={() => onSetSpaceQuote(q)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                    space.quote.author === q.author
                      ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black border-transparent"
                      : "bg-stone-500/10 border-stone-500/20 text-black dark:text-white hover:bg-stone-500/20"
                  }`}
                >
                  {q.author}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Someone Directly */}
        {emptySlotsCount > 0 && (
          <form
            onSubmit={handleAddDirect}
            className={`p-5 rounded-2xl border flex flex-col gap-3 ${
              isDark ? "bg-stone-900/80 border-stone-800" : "bg-white border-black/15 shadow-xs"
            }`}
          >
            <span className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#2E4532] dark:text-[#8EB391]" />
              Add someone to your study space
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Companion's name (e.g. Mowmee)"
                value={newCompanionName}
                onChange={(e) => setNewCompanionName(e.target.value)}
                className={`sm:col-span-2 px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#2E4532] ${
                  isDark
                    ? "bg-stone-800 border-stone-700 text-white"
                    : "bg-stone-50 border-black/20 text-black font-semibold"
                }`}
                autoFocus
                required
              />
              <input
                type="text"
                placeholder="Subject (e.g. Organic Chem)"
                value={newCompanionSubject}
                onChange={(e) => setNewCompanionSubject(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#2E4532] ${
                  isDark
                    ? "bg-stone-800 border-stone-700 text-white"
                    : "bg-stone-50 border-black/20 text-black font-semibold"
                }`}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Add to Space
              </button>
            </div>
          </form>
        )}

        {/* Active Collaborators (Up to 10) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
            <span>Collaborator List ({space.members.length}/10)</span>
            <span>{emptySlotsCount} open seats</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {space.members.map((member) => (
              <div
                key={member.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-stone-900 border-stone-800" : "bg-white border-black/15 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-[#2E4532]/15 dark:bg-[#8EB391]/20 text-[#2E4532] dark:text-[#8EB391] font-bold flex items-center justify-center font-serif text-base shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-black dark:text-white truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-black/60 dark:text-white/60 truncate">
                      {member.currentSubject || "Studying"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.isHost ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2E4532]/15 dark:bg-[#8EB391]/20 text-[#2E4532] dark:text-[#8EB391] px-2 py-0.5 rounded-md">
                      Host
                    </span>
                  ) : (
                    isHost && (
                      <button
                        onClick={() => onKickCollaborator(member.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-500/15 transition-colors cursor-pointer"
                        title="Kick collaborator"
                      >
                        Kick
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Room Code Bar */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? "bg-stone-900/60 border-stone-800" : "bg-white border-black/15 shadow-2xs"
          }`}
        >
          <div>
            <p className="text-xs font-bold text-black dark:text-white">Space Invitation Code</p>
            <p className="text-xs text-black/70 dark:text-white/70">
              Share with up to 10 friends to study together in this room.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 rounded-xl font-mono text-sm font-bold tracking-wider bg-[#2E4532]/15 dark:bg-[#8EB391]/20 text-[#2E4532] dark:text-[#8EB391] border border-[#2E4532]/30">
              {space.code}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black font-bold hover:opacity-90 transition-opacity cursor-pointer"
              title="Copy room code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Or Join Room Code */}
        <form onSubmit={handleJoin} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Or enter a room code (e.g. APR-7B9X)"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase border focus:outline-none focus:ring-1 focus:ring-[#2E4532] ${
              isDark
                ? "bg-stone-900 border-stone-700 text-white"
                : "bg-white border-black/20 text-black font-medium"
            }`}
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer shrink-0"
          >
            Join Room
          </button>
        </form>

        {/* Leader Diminish / Reset Space */}
        {isHost && (
          <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-rose-600 font-medium">
              Leader action: Close or reset this study room
            </span>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to diminish this study room and start fresh?",
                  )
                ) {
                  onDiminishSpace();
                  onClose();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl border border-rose-600/40 text-rose-600 hover:bg-rose-600/10 text-xs font-bold transition-colors cursor-pointer"
            >
              Diminish Space
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
