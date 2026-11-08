import React, { useState, useMemo } from "react";
import {
  Check,
  Plus,
  Clock,
  Trash2,
  MessageSquare,
  BookOpen,
  Heart,
  Copy,
  Users,
  Sun,
  Quote,
} from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";
import { toast } from "sonner";

interface SharedHomeViewProps {
  onOpenCollaborateModal: () => void;
  onOpenPokeModal: () => void;
}

export const SharedHomeView: React.FC<SharedHomeViewProps> = ({
  onOpenCollaborateModal,
  onOpenPokeModal,
}) => {
  const {
    currentUser,
    collaborators,
    space,
    subjects,
    topics,
    myTopics,
    toggleTopic,
    addTopic,
    deleteTopic,
    addNoteToTopic,
    theme,
  } = useMeanwhile();

  const isDark = theme === "dark";

  // Other collaborators (excluding current user)
  const otherCollaborators = useMemo(
    () => collaborators.filter((c) => c.id !== currentUser?.id),
    [collaborators, currentUser],
  );

  // Active selected companion for the right column
  const [selectedCompanionId, setSelectedCompanionId] = useState<string>("");

  React.useEffect(() => {
    if (otherCollaborators.length > 0) {
      if (!selectedCompanionId || !otherCollaborators.some((c) => c.id === selectedCompanionId)) {
        setSelectedCompanionId(otherCollaborators[0].id);
      }
    } else {
      setSelectedCompanionId("");
    }
  }, [otherCollaborators, selectedCompanionId]);

  const activeCompanion = otherCollaborators.find((c) => c.id === selectedCompanionId);

  // Companion topics for the right column
  const companionTopics = useMemo(() => {
    if (!activeCompanion) return [];
    return topics.filter((t) => t.ownerId === activeCompanion.id);
  }, [topics, activeCompanion]);

  // Form states for My Tasks (Left Column)
  const [myTaskInput, setMyTaskInput] = useState("");
  const [myTaskMinutes, setMyTaskMinutes] = useState<number | undefined>(undefined);

  // Form states for Companion Tasks (Right Column)
  const [companionTaskInput, setCompanionTaskInput] = useState("");
  const [companionTaskMinutes, setCompanionTaskMinutes] = useState<number | undefined>(undefined);

  // Note dialog state
  const [activeNoteTopicId, setActiveNoteTopicId] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");

  // Room code copied feedback
  const [copiedCode, setCopiedCode] = useState(false);

  // Stats calculation
  const myCompletedCount = myTopics.filter((t) => t.completed).length;
  const myTotalCount = myTopics.length;
  const myPercent = myTotalCount > 0 ? Math.round((myCompletedCount / myTotalCount) * 100) : 0;

  const companionCompletedCount = companionTopics.filter((t) => t.completed).length;
  const companionTotalCount = companionTopics.length;
  const companionPercent =
    companionTotalCount > 0 ? Math.round((companionCompletedCount / companionTotalCount) * 100) : 0;

  // Add task to My Tasks
  const handleAddMyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTaskInput.trim() || !currentUser) return;

    const targetSubject = subjects.find((s) => s.ownerId === currentUser.id);
    const subjectId = targetSubject ? targetSubject.id : `subj-${currentUser.id}`;

    addTopic(subjectId, myTaskInput.trim(), "Tasks", myTaskMinutes);
    setMyTaskInput("");
    setMyTaskMinutes(undefined);
  };

  // Add task to Companion's Tasks
  const handleAddCompanionTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companionTaskInput.trim() || !activeCompanion) return;

    const companionSubject = subjects.find((s) => s.ownerId === activeCompanion.id);
    const subjectId = companionSubject ? companionSubject.id : `subj-${activeCompanion.id}`;

    addTopic(
      subjectId,
      companionTaskInput.trim(),
      "Tasks",
      companionTaskMinutes,
      "",
      activeCompanion.id,
      activeCompanion.name,
    );
    setCompanionTaskInput("");
    setCompanionTaskMinutes(undefined);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(space.code);
    setCopiedCode(true);
    toast.success("Room code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitNote = (topicId: string) => {
    if (!noteBody.trim()) return;
    addNoteToTopic(topicId, noteBody.trim());
    setNoteBody("");
    setActiveNoteTopicId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8">
      {/* Top Header: Room Title, Author Quote & The Single Prominent + Button */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/15 dark:border-white/15 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-3xl sm:text-4xl font-normal text-black dark:text-[#F8F6F2] tracking-tight">
              {space.name}
            </span>
          </div>
          <p className="text-sm font-semibold text-black/75 dark:text-white/75">
            Welcome, <strong>{currentUser?.name}</strong> • Up to 10 study partners in this room
          </p>
        </div>

        {/* The single prominent "+" icon to collaborate */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCollaborateModal}
            className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] hover:opacity-90 text-white dark:text-[#141311] font-bold text-sm shadow-sm transition-all cursor-pointer"
            title="Add someone to collaborate (Up to 10)"
          >
            <div className="w-5 h-5 rounded-lg bg-white/20 dark:bg-black/20 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>
              {otherCollaborators.length > 0
                ? `${collaborators.length}/10 In Space`
                : "Add someone"}
            </span>
          </button>
        </div>
      </header>

      {/* Author Motivation Banner (Set by Space Leader) */}
      {space.quote && (
        <section
          className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            isDark
              ? "bg-[#1E1B18]/95 border-stone-800 text-[#F8F6F2]"
              : "bg-white/95 border-black/15 text-black shadow-xs"
          }`}
        >
          <div className="flex items-start gap-3">
            <Quote className="w-5 h-5 text-[#2E4532] dark:text-[#8EB391] shrink-0 mt-0.5 opacity-80" />
            <div className="flex flex-col gap-1">
              <p className="font-serif text-lg sm:text-xl font-normal italic leading-relaxed text-black dark:text-[#F8F6F2]">
                "{space.quote.text}"
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2E4532] dark:text-[#8EB391]">
                — {space.quote.author}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Dual-Column Desk: My Tasks on the Left, Her/Their Tasks on the Right */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        {/* ======================================================== */}
        {/* COLUMN 1: MY TASKS (Left Side)                           */}
        {/* ======================================================== */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border flex flex-col gap-6 transition-all ${
            isDark
              ? "bg-[#1C1916]/95 border-stone-800 text-[#F8F6F2]"
              : "bg-white/95 border-black/15 text-black shadow-xs"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-black/10 dark:border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-black dark:text-[#F8F6F2] tracking-tight">
                  My Tasks
                </h2>
                <p className="text-sm font-semibold text-black/75 dark:text-white/75 mt-0.5">
                  {myCompletedCount} of {myTotalCount} completed ({myPercent}%)
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#2E4532]/10 dark:bg-[#8EB391]/15 text-[#2E4532] dark:text-[#8EB391] flex items-center justify-center font-serif text-lg font-bold">
                {currentUser?.name?.charAt(0) || "M"}
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2E4532] dark:bg-[#8EB391] h-full transition-all duration-300 rounded-full"
                style={{ width: `${myPercent}%` }}
              />
            </div>
          </div>

          {/* Inline Add Task Form for Myself */}
          <form onSubmit={handleAddMyTask} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="What would you like to achieve? (Press Enter)"
                value={myTaskInput}
                onChange={(e) => setMyTaskInput(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-2xl text-base border focus:outline-none focus:ring-2 focus:ring-[#2E4532] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-white placeholder-stone-400"
                    : "bg-stone-50 border-black/20 text-black font-semibold placeholder-stone-500"
                }`}
              />
              <button
                type="submit"
                disabled={!myTaskInput.trim()}
                className="px-5 py-3 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] disabled:opacity-40 text-white dark:text-[#141311] text-sm font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Add Task
              </button>
            </div>

            {/* Quick minute pills */}
            <div className="flex items-center gap-1.5 pl-1">
              <span className="text-xs font-semibold text-black/60 dark:text-white/60 mr-1">
                Estimate:
              </span>
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setMyTaskMinutes(myTaskMinutes === mins ? undefined : mins)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    myTaskMinutes === mins
                      ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black border-transparent"
                      : "bg-stone-500/10 border-stone-500/15 text-black dark:text-white hover:bg-stone-500/20"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </form>

          {/* Task Checklist */}
          <div className="flex flex-col gap-3 min-h-[220px]">
            {myTopics.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 text-center flex flex-col items-center justify-center gap-2">
                <BookOpen className="w-8 h-8 text-stone-400 stroke-[1.5]" />
                <p className="font-serif text-lg font-medium text-black dark:text-white">
                  Your desk is clean.
                </p>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Type a goal above and press Enter to begin your study session.
                </p>
              </div>
            ) : (
              myTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    topic.completed
                      ? "opacity-55 line-through border-transparent bg-stone-500/5 text-black/60 dark:text-white/60"
                      : isDark
                        ? "bg-stone-900/90 border-stone-800 hover:border-stone-700 text-white"
                        : "bg-[#FDFBF7] border-black/15 hover:border-black/35 text-black shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1">
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          topic.completed
                            ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black"
                            : "border-2 border-black/40 dark:border-white/40 hover:border-[#2E4532]"
                        }`}
                        title={topic.completed ? "Mark incomplete" : "Mark completed"}
                      >
                        {topic.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="flex flex-col flex-1">
                        <span className="text-base sm:text-lg font-semibold leading-snug text-black dark:text-[#F8F6F2]">
                          {topic.name}
                        </span>

                        {/* Notes on topic */}
                        {topic.notes && topic.notes.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1.5">
                            {topic.notes.map((n) => (
                              <div
                                key={n.id}
                                className="p-2.5 rounded-xl bg-stone-500/10 text-xs text-black dark:text-white font-medium"
                              >
                                <span className="font-bold">{n.authorName}: </span>
                                <span>"{n.body}"</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Note Form */}
                        {activeNoteTopicId === topic.id && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Add a note (e.g. page numbers)..."
                              value={noteBody}
                              onChange={(e) => setNoteBody(e.target.value)}
                              className={`flex-1 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#2E4532] ${
                                isDark
                                  ? "bg-stone-900 border-stone-700 text-white"
                                  : "bg-white border-black/20 text-black font-semibold"
                              }`}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmitNote(topic.id);
                              }}
                            />
                            <button
                              onClick={() => handleSubmitNote(topic.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black text-xs font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setActiveNoteTopicId(null);
                                setNoteBody("");
                              }}
                              className="px-2.5 py-1.5 text-xs text-black/60 dark:text-white/60"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {topic.estimatedMinutes && (
                        <span className="flex items-center gap-1 text-xs font-bold text-black/80 dark:text-white/80 bg-stone-500/10 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {topic.estimatedMinutes}m
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setActiveNoteTopicId(activeNoteTopicId === topic.id ? null : topic.id);
                          setNoteBody("");
                        }}
                        className="p-1.5 rounded-xl text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Add note"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteTopic(topic.id)}
                        className="p-1.5 rounded-xl text-black/40 dark:text-white/40 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: HER TASKS / COMPANION'S TASKS (Right Side)     */}
        {/* ======================================================== */}
        {activeCompanion ? (
          <div
            className={`p-6 sm:p-8 rounded-3xl border flex flex-col gap-6 transition-all ${
              isDark
                ? "bg-[#1C1916]/95 border-stone-800 text-[#F8F6F2]"
                : "bg-white/95 border-black/15 text-black shadow-xs"
            }`}
          >
            {/* Header with companion selector if > 1 companion */}
            <div className="flex flex-col gap-3 border-b border-black/10 dark:border-white/10 pb-4">
              {/* Multi-companion tabs if more than 1 collaborator */}
              {otherCollaborators.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {otherCollaborators.map((c) => {
                    const cTopics = topics.filter((t) => t.ownerId === c.id);
                    const cDone = cTopics.filter((t) => t.completed).length;
                    const isSelected = c.id === selectedCompanionId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCompanionId(c.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 shrink-0 ${
                          isSelected
                            ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-[#141311] border-transparent shadow-2xs"
                            : "bg-stone-500/10 border-stone-500/20 text-black dark:text-white hover:bg-stone-500/20"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{c.name}</span>
                        <span className="opacity-70 text-[10px]">
                          ({cDone}/{cTopics.length})
                        </span>
                      </button>
                    );
                  })}
                  <button
                    onClick={onOpenCollaborateModal}
                    className="p-1.5 rounded-xl border border-dashed border-black/20 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white text-xs font-bold flex items-center gap-1"
                    title="Add another study partner"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-black dark:text-[#F8F6F2] tracking-tight">
                    {activeCompanion.name}'s Tasks
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-sm font-semibold text-black/75 dark:text-white/75">
                      Studying: <strong>{activeCompanion.currentSubject}</strong> •{" "}
                      {companionCompletedCount} of {companionTotalCount} completed (
                      {companionPercent}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenPokeModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                    title="Send a nudge"
                  >
                    <Heart className="w-4 h-4 fill-rose-500/30" />
                    <span>Nudge</span>
                  </button>
                </div>
              </div>

              {/* Companion Progress line */}
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#2E4532] dark:bg-[#8EB391] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${companionPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Inline Add Task for Companion */}
            <form onSubmit={handleAddCompanionTask} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Add a task for ${activeCompanion.name}...`}
                  value={companionTaskInput}
                  onChange={(e) => setCompanionTaskInput(e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-2xl text-base border focus:outline-none focus:ring-2 focus:ring-[#2E4532] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-white placeholder-stone-400"
                      : "bg-stone-50 border-black/20 text-black font-semibold placeholder-stone-500"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!companionTaskInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] disabled:opacity-40 text-white dark:text-[#141311] text-sm font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  Add Task
                </button>
              </div>

              {/* Quick minute pills */}
              <div className="flex items-center gap-1.5 pl-1">
                <span className="text-xs font-semibold text-black/60 dark:text-white/60 mr-1">
                  Estimate:
                </span>
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setCompanionTaskMinutes(companionTaskMinutes === mins ? undefined : mins)
                    }
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      companionTaskMinutes === mins
                        ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black border-transparent"
                        : "bg-stone-500/10 border-stone-500/15 text-black dark:text-white hover:bg-stone-500/20"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </form>

            {/* Companion Task Checklist */}
            <div className="flex flex-col gap-3 min-h-[220px]">
              {companionTopics.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 text-center flex flex-col items-center justify-center gap-2">
                  <BookOpen className="w-8 h-8 text-stone-400 stroke-[1.5]" />
                  <p className="font-serif text-lg font-medium text-black dark:text-white">
                    {activeCompanion.name} has no tasks listed yet.
                  </p>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    You can add a study goal for {activeCompanion.name} in the box above!
                  </p>
                </div>
              ) : (
                companionTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      topic.completed
                        ? "opacity-55 line-through border-transparent bg-stone-500/5 text-black/60 dark:text-white/60"
                        : isDark
                          ? "bg-stone-900/90 border-stone-800 hover:border-stone-700 text-white"
                          : "bg-[#FDFBF7] border-black/15 hover:border-black/35 text-black shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 flex-1">
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            topic.completed
                              ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black"
                              : "border-2 border-black/40 dark:border-white/40 hover:border-[#2E4532]"
                          }`}
                          title="Collaborative check"
                        >
                          {topic.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="flex flex-col flex-1">
                          <span className="text-base sm:text-lg font-semibold leading-snug text-black dark:text-[#F8F6F2]">
                            {topic.name}
                          </span>

                          {/* Notes */}
                          {topic.notes && topic.notes.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1.5">
                              {topic.notes.map((n) => (
                                <div
                                  key={n.id}
                                  className="p-2.5 rounded-xl bg-stone-500/10 text-xs text-black dark:text-white font-medium"
                                >
                                  <span className="font-bold">{n.authorName}: </span>
                                  <span>"{n.body}"</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {topic.estimatedMinutes && (
                          <span className="flex items-center gap-1 text-xs font-bold text-black/80 dark:text-white/80 bg-stone-500/10 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            {topic.estimatedMinutes}m
                          </span>
                        )}

                        <button
                          onClick={() => deleteTopic(topic.id)}
                          className="p-1.5 rounded-xl text-black/40 dark:text-white/40 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* INITIAL STAGE: NO COMPANION YET                          */
          /* Serene, welcoming invitation notebook page              */
          /* ======================================================== */
          <div
            className={`p-8 sm:p-10 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center gap-6 transition-all min-h-[480px] ${
              isDark
                ? "bg-[#1C1916]/60 border-stone-800 text-[#F8F6F2]"
                : "bg-white/80 border-black/20 text-black shadow-2xs"
            }`}
          >
            <div className="w-16 h-16 rounded-3xl bg-[#2E4532]/10 dark:bg-[#8EB391]/15 text-[#2E4532] dark:text-[#8EB391] flex items-center justify-center shadow-xs">
              <Sun className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="flex flex-col gap-2 max-w-md">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-black dark:text-white">
                Her Desk / Companion's Tasks
              </h3>
              <p className="text-sm font-medium text-black/75 dark:text-white/75 leading-relaxed">
                Study side by side with your companion. Once you add someone to your space, their
                live tasks and progress will unfold right here beside yours.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onOpenCollaborateModal}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] hover:opacity-90 text-white dark:text-[#141311] font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Invite Study Companion</span>
              </button>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                  Or share room code:
                </span>
                <button
                  onClick={handleCopyRoomCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-500/10 hover:bg-stone-500/20 text-black dark:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                  title="Click to copy code"
                >
                  <span>{space.code}</span>
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
