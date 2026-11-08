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
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";
import { CuteTimer } from "./CuteTimer";
import { FAMOUS_AUTHOR_QUOTES } from "../../lib/initial-data";
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
    activity,
    isHost,
    setSpaceQuote,
    theme,
  } = useMeanwhile();

  const isDark = theme === "dark";

  // Collaborators excluding current user
  const otherCollaborators = useMemo(
    () => collaborators.filter((c) => c.id !== currentUser?.id),
    [collaborators, currentUser],
  );

  // Active companion tab for the right desk column
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

  // Optional bottom quote visibility
  const [showBottomQuote, setShowBottomQuote] = useState(true);

  // Journal filter state
  const [journalFilter, setJournalFilter] = useState<"all" | "completed" | "notes">("all");

  // Stats
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

  // Filtered activity journal events
  const filteredActivity = useMemo(() => {
    return activity.filter((item) => {
      if (journalFilter === "completed") return item.kind === "topic_completed";
      if (journalFilter === "notes") return item.kind === "note_added";
      return true;
    });
  }, [activity, journalFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8">
      {/* Top Header: Room Title, Status & Prominent Collaboration Button */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-black dark:text-[#F8F6F2] tracking-tight">
              {space.name}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70">
            Welcome, <strong>{currentUser?.name}</strong> • Up to 10 study companions in this space
          </p>
        </div>

        {/* The single prominent collaborate button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCollaborateModal}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] hover:opacity-90 text-white dark:text-[#141311] font-bold text-sm shadow-sm transition-all cursor-pointer"
            title="Collaborate with friends (Up to 10)"
          >
            <div className="w-5 h-5 rounded-lg bg-white/20 dark:bg-black/20 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>
              {otherCollaborators.length > 0
                ? `${collaborators.length}/10 Studying`
                : "Add someone"}
            </span>
          </button>
        </div>
      </header>

      {/* Cute Focus Clock */}
      <CuteTimer isDark={isDark} />

      {/* Main Dual-Column Desk: My Tasks on the Left, Her/Their Tasks on the Right */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ======================================================== */}
        {/* COLUMN 1: MY TASKS (Left Side)                           */}
        {/* ======================================================== */}
        <div
          className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDark
              ? "bg-[#1C1916]/65 border-white/10 text-white shadow-xl backdrop-blur-xl"
              : "bg-white/60 border-white/60 text-black shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col gap-2.5 border-b border-black/10 dark:border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-black dark:text-white tracking-tight">
                  My Tasks
                </h2>
                <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 mt-0.5">
                  {myCompletedCount} of {myTotalCount} completed ({myPercent}%)
                </p>
              </div>

              <div className="w-9 h-9 rounded-2xl bg-[#2E4532]/10 dark:bg-[#8EB391]/15 text-[#2E4532] dark:text-[#8EB391] flex items-center justify-center font-serif text-base font-bold">
                {currentUser?.name?.charAt(0) || "M"}
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2E4532] dark:bg-[#8EB391] h-full transition-all duration-300 rounded-full"
                style={{ width: `${myPercent}%` }}
              />
            </div>
          </div>

          {/* Translucent Add Task Form */}
          <form onSubmit={handleAddMyTask} className="flex flex-col gap-2.5 mt-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="What's on your mind to study today? (Press Enter)"
                value={myTaskInput}
                onChange={(e) => setMyTaskInput(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-2xl text-base border focus:outline-none transition-all ${
                  isDark
                    ? "bg-black/30 border-white/15 text-white placeholder-stone-400 focus:bg-black/50 focus:border-white/30"
                    : "bg-white/50 border-black/15 text-black font-medium placeholder-stone-500 focus:bg-white/80 focus:border-[#2E4532]"
                }`}
              />
              <button
                type="submit"
                disabled={!myTaskInput.trim()}
                className="px-4 sm:px-5 py-3 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] disabled:opacity-40 text-white dark:text-[#141311] text-xs sm:text-sm font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
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
                      ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black border-transparent shadow-2xs"
                      : "bg-white/40 dark:bg-black/20 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-white/70"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </form>

          {/* Task Checklist */}
          <div className="flex flex-col gap-2.5 mt-2 min-h-[200px]">
            {myTopics.length === 0 ? (
              <div className="py-10 px-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 text-center flex flex-col items-center justify-center gap-2">
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
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    topic.completed
                      ? "opacity-55 line-through border-transparent bg-stone-500/5 text-black/60 dark:text-white/60"
                      : isDark
                        ? "bg-stone-900/40 border-white/10 hover:border-white/25 text-white"
                        : "bg-white/55 border-black/10 hover:border-black/25 text-black shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Circular tactile checkbox */}
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          topic.completed
                            ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black border-transparent"
                            : "border-2 border-stone-400 dark:border-stone-500 hover:border-[#2E4532]"
                        }`}
                        title={topic.completed ? "Mark incomplete" : "Mark completed"}
                      >
                        {topic.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex flex-col flex-1">
                        <span className="text-base sm:text-lg font-medium leading-snug text-black dark:text-white">
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

                        {/* Add note input */}
                        {activeNoteTopicId === topic.id && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Add a note (e.g. page numbers)..."
                              value={noteBody}
                              onChange={(e) => setNoteBody(e.target.value)}
                              className={`flex-1 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#2E4532] ${
                                isDark
                                  ? "bg-black/40 border-white/20 text-white"
                                  : "bg-white/80 border-black/20 text-black font-semibold"
                              }`}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmitNote(topic.id);
                              }}
                            />
                            <button
                              onClick={() => handleSubmitNote(topic.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black text-xs font-bold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setActiveNoteTopicId(null);
                                setNoteBody("");
                              }}
                              className="px-2.5 py-1.5 text-xs text-black/60 dark:text-white/60 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {topic.estimatedMinutes && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-black/80 dark:text-white/80 bg-stone-500/10 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3 h-3" />
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
            className={`p-6 sm:p-7 rounded-3xl border transition-all ${
              isDark
                ? "bg-[#1C1916]/65 border-white/10 text-white shadow-xl backdrop-blur-xl"
                : "bg-white/60 border-white/60 text-black shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            }`}
          >
            {/* Header */}
            <div className="flex flex-col gap-2.5 border-b border-black/10 dark:border-white/10 pb-4">
              {/* Multi-companion tabs if > 1 companion */}
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
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                          isSelected
                            ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-[#141311] border-transparent shadow-2xs"
                            : "bg-white/40 dark:bg-black/20 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-white/70"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-black dark:text-white tracking-tight">
                    {activeCompanion.name}'s Tasks
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70">
                      Studying: <strong>{activeCompanion.currentSubject}</strong> •{" "}
                      {companionCompletedCount} of {companionTotalCount} completed (
                      {companionPercent}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenPokeModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                    title="Send a nudge"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                    <span>Nudge</span>
                  </button>
                </div>
              </div>

              {/* Companion Progress line */}
              <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2E4532] dark:bg-[#8EB391] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${companionPercent}%` }}
                />
              </div>
            </div>

            {/* Translucent Add Task Form for Companion */}
            <form onSubmit={handleAddCompanionTask} className="flex flex-col gap-2.5 mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Add a study goal for ${activeCompanion.name}...`}
                  value={companionTaskInput}
                  onChange={(e) => setCompanionTaskInput(e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-2xl text-base border focus:outline-none transition-all ${
                    isDark
                      ? "bg-black/30 border-white/15 text-white placeholder-stone-400 focus:bg-black/50 focus:border-white/30"
                      : "bg-white/50 border-black/15 text-black font-medium placeholder-stone-500 focus:bg-white/80 focus:border-[#2E4532]"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!companionTaskInput.trim()}
                  className="px-4 sm:px-5 py-3 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] disabled:opacity-40 text-white dark:text-[#141311] text-xs sm:text-sm font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
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
                        ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black border-transparent shadow-2xs"
                        : "bg-white/40 dark:bg-black/20 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-white/70"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </form>

            {/* Companion Task Checklist */}
            <div className="flex flex-col gap-2.5 mt-2 min-h-[200px]">
              {companionTopics.length === 0 ? (
                <div className="py-10 px-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 text-center flex flex-col items-center justify-center gap-2">
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
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      topic.completed
                        ? "opacity-55 line-through border-transparent bg-stone-500/5 text-black/60 dark:text-white/60"
                        : isDark
                          ? "bg-stone-900/40 border-white/10 hover:border-white/25 text-white"
                          : "bg-white/55 border-black/10 hover:border-black/25 text-black shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Circular tactile checkbox */}
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            topic.completed
                              ? "bg-[#2E4532] dark:bg-[#8EB391] text-white dark:text-black border-transparent"
                              : "border-2 border-stone-400 dark:border-stone-500 hover:border-[#2E4532]"
                          }`}
                          title="Collaborative check"
                        >
                          {topic.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="flex flex-col flex-1">
                          <span className="text-base sm:text-lg font-medium leading-snug text-black dark:text-white">
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
                          <span className="flex items-center gap-1 text-xs font-semibold text-black/80 dark:text-white/80 bg-stone-500/10 px-2 py-0.5 rounded-lg">
                            <Clock className="w-3 h-3" />
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
            className={`p-8 sm:p-10 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center gap-6 transition-all min-h-[440px] ${
              isDark
                ? "bg-[#1C1916]/50 border-white/10 text-white backdrop-blur-xl"
                : "bg-white/50 border-black/15 text-black shadow-sm backdrop-blur-xl"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#2E4532]/10 dark:bg-[#8EB391]/15 text-[#2E4532] dark:text-[#8EB391] flex items-center justify-center shadow-2xs">
              <Sun className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="flex flex-col gap-2 max-w-md">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-black dark:text-white">
                Her Desk / Companion's Tasks
              </h3>
              <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 leading-relaxed">
                Study side by side with your companion. Once you add someone to your space, their
                live tasks and progress will unfold right here beside yours.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onOpenCollaborateModal}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-[#2E4532] dark:bg-[#8EB391] hover:opacity-90 text-white dark:text-[#141311] font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Invite Study Companion</span>
              </button>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                  Or share room code:
                </span>
                <button
                  onClick={handleCopyRoomCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white/80 text-black dark:text-white font-mono text-xs font-bold transition-colors cursor-pointer border border-black/10 dark:border-white/10"
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

      {/* ======================================================== */}
      {/* "MEANWHILE..." SHARED JOURNAL SHOWCASING LIVE UPDATES     */}
      {/* ======================================================== */}
      <section
        className={`p-6 sm:p-7 rounded-3xl border transition-all ${
          isDark
            ? "bg-[#1C1916]/65 border-white/10 text-white shadow-xl backdrop-blur-xl"
            : "bg-white/60 border-white/60 text-black shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-normal text-black dark:text-white tracking-tight flex items-center gap-2">
              <span>Meanwhile...</span>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#2E4532] dark:text-[#8EB391] bg-[#2E4532]/10 dark:bg-[#8EB391]/15 px-2.5 py-0.5 rounded-full">
                Shared Updates
              </span>
            </h3>
            <p className="text-xs text-black/65 dark:text-white/65 mt-0.5">
              A live chronicle of goals crossed off and moments shared across your study spaces.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5">
            {(["all", "completed", "notes"] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setJournalFilter(filterKey)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                  journalFilter === filterKey
                    ? "bg-[#2E4532] text-white border-transparent dark:bg-[#8EB391] dark:text-black shadow-2xs"
                    : "bg-white/40 dark:bg-black/20 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-white/70"
                }`}
              >
                {filterKey === "all" ? "All" : filterKey === "completed" ? "Completed" : "Notes"}
              </button>
            ))}
          </div>
        </div>

        {/* Activity feed list */}
        <div className="flex flex-col gap-2.5 mt-4 max-h-64 overflow-y-auto pr-1">
          {filteredActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-black/60 dark:text-white/60 flex flex-col items-center justify-center gap-1.5">
              <BookOpen className="w-6 h-6 text-stone-400 stroke-[1.5]" />
              <p className="font-serif text-base font-medium text-black dark:text-white">
                No updates yet today.
              </p>
              <p className="text-xs">
                Check off a task or write a note to add a moment to your shared journal.
              </p>
            </div>
          ) : (
            filteredActivity.map((event) => (
              <div
                key={event.id}
                className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-sm transition-all ${
                  isDark
                    ? "bg-black/20 border-white/5 hover:border-white/15 text-white"
                    : "bg-white/50 border-black/10 hover:border-black/20 text-black"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      event.kind === "topic_completed"
                        ? "bg-[#2E4532]/15 text-[#2E4532] dark:text-[#8EB391]"
                        : event.kind === "note_added"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : event.kind === "collaborator_joined"
                            ? "bg-[#2E4532]/15 text-[#2E4532] dark:text-[#8EB391]"
                            : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {event.kind === "topic_completed" ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : event.kind === "note_added" ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : event.kind === "collaborator_joined" ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <p className="font-serif text-sm sm:text-base font-normal leading-snug truncate text-black dark:text-white">
                      {event.detail}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-black/50 dark:text-white/50 whitespace-nowrap shrink-0">
                  {new Date(event.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* OPTIONAL QUOTE AT THE BOTTOM                             */}
      {/* ======================================================== */}
      {space.quote && (
        <section
          className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            isDark
              ? "bg-[#1C1916]/55 border-white/10 text-white backdrop-blur-xl"
              : "bg-white/55 border-white/60 text-black shadow-xs backdrop-blur-xl"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E4532] dark:text-[#8EB391] flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-[#2E4532] dark:text-[#8EB391]" />
              Study Motivation (Optional)
            </span>

            <div className="flex items-center gap-2">
              {/* Leader can cycle quote */}
              {isHost && (
                <div className="flex items-center gap-1">
                  {FAMOUS_AUTHOR_QUOTES.slice(0, 4).map((q) => (
                    <button
                      key={q.author}
                      onClick={() => setSpaceQuote(q)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                        space.quote?.author === q.author
                          ? "bg-[#2E4532] text-white dark:bg-[#8EB391] dark:text-black border-transparent"
                          : "bg-white/40 dark:bg-black/20 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-white/70"
                      }`}
                    >
                      {q.author.split(" ").pop()}
                    </button>
                  ))}
                </div>
              )}

              {/* Toggle visibility */}
              <button
                onClick={() => setShowBottomQuote(!showBottomQuote)}
                className="p-1 rounded-xl text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer"
                title={showBottomQuote ? "Collapse quote" : "Expand quote"}
              >
                {showBottomQuote ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {showBottomQuote && (
            <div className="mt-2.5 flex flex-col gap-1">
              <p className="font-serif text-base sm:text-lg font-normal italic leading-relaxed text-black dark:text-[#F8F6F2]">
                "{space.quote.text}"
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60">
                — {space.quote.author}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
