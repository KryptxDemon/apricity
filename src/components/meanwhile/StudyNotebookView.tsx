import React, { useState, useMemo } from "react";
import {
  Plus,
  Check,
  Trash2,
  Clock,
  Sparkles,
  MessageSquare,
  FolderPlus,
  BookOpen,
} from "lucide-react";
import { useMeanwhile } from "../../context/MeanwhileContext";
import { parseStudyNotes, type ParsedTopic } from "../../lib/topic-parser";

interface StudyNotebookViewProps {
  selectedCollaboratorId?: string;
}

export const StudyNotebookView: React.FC<StudyNotebookViewProps> = ({ selectedCollaboratorId }) => {
  const {
    currentUser,
    collaborators,
    subjects,
    topics,
    addSubject,
    deleteSubject,
    addTopic,
    addBulkTopics,
    toggleTopic,
    deleteTopic,
    addNoteToTopic,
    theme,
  } = useMeanwhile();

  const isDark = theme === "dark";

  const targetCollaborator = selectedCollaboratorId
    ? collaborators.find((c) => c.id === selectedCollaboratorId)
    : null;
  const isCompanionView = Boolean(targetCollaborator && targetCollaborator.id !== currentUser?.id);
  const targetUserId = targetCollaborator ? targetCollaborator.id : currentUser?.id;

  const userSubjects = useMemo(() => {
    return subjects.filter((s) => s.ownerId === targetUserId);
  }, [subjects, targetUserId]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  React.useEffect(() => {
    if (
      userSubjects.length > 0 &&
      (!selectedSubjectId || !userSubjects.some((s) => s.id === selectedSubjectId))
    ) {
      setSelectedSubjectId(userSubjects[0].id);
    }
  }, [userSubjects, selectedSubjectId]);

  // Topic creation
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicChapter, setNewTopicChapter] = useState("");
  const [newTopicMinutes, setNewTopicMinutes] = useState("");
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // New Subject modal
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState<"sage" | "forest" | "blue" | "peach">(
    "sage",
  );

  // Deterministic Text Parser modal
  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [rawTextNotes, setRawTextNotes] = useState("");
  const [previewParsed, setPreviewParsed] = useState<ParsedTopic[]>([]);

  // Note dialog
  const [activeNoteTopicId, setActiveNoteTopicId] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");

  const currentSubject = userSubjects.find((s) => s.id === selectedSubjectId);

  const subjectTopics = useMemo(() => {
    return topics.filter((t) => t.ownerId === targetUserId && t.subjectId === currentSubject?.id);
  }, [topics, targetUserId, currentSubject]);

  const chapters = useMemo(() => {
    const map = new Map<string, typeof subjectTopics>();
    subjectTopics.forEach((t) => {
      const ch = t.chapter || "General Topics";
      if (!map.has(ch)) {
        map.set(ch, []);
      }
      map.get(ch)!.push(t);
    });
    return Array.from(map.entries());
  }, [subjectTopics]);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !currentSubject) return;

    const minutes = newTopicMinutes ? parseInt(newTopicMinutes, 10) : undefined;
    addTopic(currentSubject.id, newTopicName, newTopicChapter, minutes);
    setNewTopicName("");
    setNewTopicChapter("");
    setNewTopicMinutes("");
    setIsAddingTopic(false);
  };

  const handleParseInput = (text: string) => {
    setRawTextNotes(text);
    if (!text.trim()) {
      setPreviewParsed([]);
      return;
    }
    const result = parseStudyNotes(text, newTopicChapter || currentSubject?.name || "General");
    setPreviewParsed(result.topics);
  };

  const handleApplyParsedNotes = () => {
    if (previewParsed.length === 0 || !currentSubject) return;
    addBulkTopics(currentSubject.id, previewParsed);
    setRawTextNotes("");
    setPreviewParsed([]);
    setIsParserModalOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const created = addSubject(newSubjectName.trim(), newSubjectColor);
    setSelectedSubjectId(created.id);
    setNewSubjectName("");
    setIsNewSubjectModalOpen(false);
  };

  const handleSubmitNote = (topicId: string) => {
    if (!noteBody.trim()) return;
    addNoteToTopic(topicId, noteBody.trim());
    setNoteBody("");
    setActiveNoteTopicId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8">
      {/* Title & Actions */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-500/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#657B68] font-medium font-sans">
            {isCompanionView
              ? `${targetCollaborator?.name}'s Study List`
              : "My Study Notebook & To-Do Lists"}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mt-1">
            {isCompanionView
              ? `${targetCollaborator?.name}'s current chapters`
              : "Organize your study goals"}
          </h1>
          <p className="text-xs sm:text-sm opacity-70 font-light mt-1">
            {isCompanionView
              ? "See what your study companion is working on in real time."
              : "Add subjects, chapters, and tasks. Use the deterministic notes parser to convert syllabi into organized lists."}
          </p>
        </div>

        {!isCompanionView && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsParserModalOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shadow-2xs cursor-pointer border ${
                isDark
                  ? "bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-100"
                  : "bg-white/90 border-[#A8B7A0]/40 hover:bg-white text-[#514A43]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#657B68]" />
              <span>Paste Unstructured Notes</span>
            </button>
            <button
              onClick={() => setIsNewSubjectModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#657B68] hover:bg-[#516354] text-white text-xs font-medium transition-all shadow-2xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Subject</span>
            </button>
          </div>
        )}
      </section>

      {/* Subjects Ribbon */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {userSubjects.map((subj) => {
          const isSelected = subj.id === currentSubject?.id;
          return (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? "bg-[#657B68] text-white border-[#657B68] shadow-xs"
                  : isDark
                    ? "bg-stone-800/80 border-stone-700 hover:bg-stone-800"
                    : "bg-white/80 border-[#A8B7A0]/30 hover:bg-white text-[#514A43]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  subj.color === "forest"
                    ? "bg-emerald-500"
                    : subj.color === "blue"
                      ? "bg-sky-500"
                      : subj.color === "peach"
                        ? "bg-amber-400"
                        : "bg-stone-400"
                }`}
              />
              <span>{subj.name}</span>
            </button>
          );
        })}
      </section>

      {/* Main Notebook Card */}
      {currentSubject ? (
        <div
          className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-sm flex flex-col gap-6 ${
            isDark
              ? "bg-stone-900/85 border-stone-800 text-stone-100"
              : "bg-white/85 border-[#A8B7A0]/40 text-[#514A43] shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between border-b border-stone-500/20 pb-4">
            <div>
              <h2 className="font-serif text-2xl font-normal">{currentSubject.name}</h2>
              <span className="text-xs opacity-65 font-light">
                {subjectTopics.filter((t) => t.completed).length} of {subjectTopics.length}{" "}
                completed
              </span>
            </div>

            {!isCompanionView && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingTopic(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#657B68]/15 hover:bg-[#657B68]/25 text-xs text-[#657B68] font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add topic</span>
                </button>
                <button
                  onClick={() => deleteSubject(currentSubject.id)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50/10 transition-colors cursor-pointer"
                  title="Delete subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Inline Add Topic Form */}
          {isAddingTopic && !isCompanionView && (
            <form
              onSubmit={handleCreateTopic}
              className={`p-4 rounded-2xl border flex flex-col gap-3 animate-in fade-in ${
                isDark ? "bg-stone-800/80 border-stone-700" : "bg-[#F6F3EB]/85 border-[#A8B7A0]/40"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Topic title (e.g. Chapter 1 exercises)"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className={`sm:col-span-2 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-stone-100"
                      : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
                  }`}
                  autoFocus
                  required
                />
                <input
                  type="number"
                  placeholder="Est. mins (e.g. 30)"
                  value={newTopicMinutes}
                  onChange={(e) => setNewTopicMinutes(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-stone-100"
                      : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Chapter heading (optional, e.g. Unit 1: Foundations)"
                  value={newTopicChapter}
                  onChange={(e) => setNewTopicChapter(e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-stone-100"
                      : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
                  }`}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTopic(false)}
                    className="px-3 py-1.5 rounded-xl text-xs opacity-70 hover:opacity-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#657B68] text-white text-xs font-medium hover:bg-[#516354]"
                  >
                    Save topic
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Chapters & Topics List */}
          {chapters.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-8 h-8 text-[#A8B7A0] stroke-[1.5]" />
              <p className="font-serif text-lg opacity-80">
                This subject is clean and waiting for your first task.
              </p>
              <button
                onClick={() => setIsAddingTopic(true)}
                className="mt-2 px-4 py-1.5 rounded-xl bg-[#657B68] text-white text-xs font-medium hover:bg-[#516354]"
              >
                + Add Topic
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {chapters.map(([chapterName, chapterTopics]) => (
                <div key={chapterName} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#657B68] tracking-wide uppercase font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#657B68]" />
                    <span>{chapterName}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {chapterTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          topic.completed
                            ? "opacity-55 line-through border-transparent"
                            : isDark
                              ? "bg-stone-800/70 border-stone-700/60 hover:border-[#657B68]"
                              : "bg-white/90 border-[#A8B7A0]/30 hover:border-[#657B68] shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              disabled={isCompanionView}
                              onClick={() => !isCompanionView && toggleTopic(topic.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                isCompanionView ? "cursor-default" : "cursor-pointer"
                              } ${
                                topic.completed
                                  ? "bg-[#657B68] text-white shadow-2xs"
                                  : "border border-stone-400 hover:border-[#657B68]"
                              }`}
                            >
                              {topic.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>

                            <div className="flex flex-col flex-1">
                              <span className="text-sm font-sans font-medium">{topic.name}</span>
                              {topic.description && (
                                <p className="text-xs opacity-70 font-light mt-0.5">
                                  {topic.description}
                                </p>
                              )}

                              {/* Subtopics */}
                              {topic.subtopics && topic.subtopics.length > 0 && (
                                <div className="mt-2 pl-2 border-l border-stone-500/25 flex flex-col gap-1">
                                  {topic.subtopics.map((st) => (
                                    <div
                                      key={st.id}
                                      className="flex items-center gap-2 text-xs opacity-75"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#A8B7A0]" />
                                      <span>{st.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Notes */}
                              {topic.notes && topic.notes.length > 0 && (
                                <div className="mt-2.5 flex flex-col gap-1.5">
                                  {topic.notes.map((note) => (
                                    <div
                                      key={note.id}
                                      className="p-2 rounded-xl bg-stone-500/10 border border-stone-500/15 text-xs"
                                    >
                                      <div className="flex items-center justify-between text-[10px] opacity-60 mb-0.5">
                                        <span className="font-semibold">{note.authorName}</span>
                                        <span>
                                          {new Date(note.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <p className="italic font-serif text-xs">"{note.body}"</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Note Input */}
                              {activeNoteTopicId === topic.id && (
                                <div className="mt-2.5 flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Leave a note on this topic..."
                                    value={noteBody}
                                    onChange={(e) => setNoteBody(e.target.value)}
                                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                                      isDark
                                        ? "bg-stone-900 border-stone-700 text-stone-100"
                                        : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
                                    }`}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSubmitNote(topic.id);
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSubmitNote(topic.id)}
                                    className="px-3 py-1.5 rounded-xl bg-[#657B68] text-white text-xs font-medium hover:bg-[#516354]"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveNoteTopicId(null);
                                      setNoteBody("");
                                    }}
                                    className="px-2 py-1.5 rounded-xl text-xs opacity-60 hover:opacity-100"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {topic.estimatedMinutes && (
                              <span className="flex items-center gap-1 text-[11px] opacity-70 bg-stone-500/10 px-2 py-0.5 rounded-md font-sans">
                                <Clock className="w-3 h-3" />
                                {topic.estimatedMinutes}m
                              </span>
                            )}

                            <button
                              onClick={() => {
                                setActiveNoteTopicId(
                                  activeNoteTopicId === topic.id ? null : topic.id,
                                );
                                setNoteBody("");
                              }}
                              className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                              title="Leave a note"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {!isCompanionView && (
                              <button
                                onClick={() => deleteTopic(topic.id)}
                                className="p-1 rounded-lg opacity-40 hover:opacity-100 hover:text-rose-500 transition-all"
                                title="Delete topic"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
            isDark
              ? "bg-stone-900/60 border-stone-800"
              : "bg-white/80 border-[#A8B7A0]/30 shadow-xs"
          }`}
        >
          <BookOpen className="w-10 h-10 text-[#A8B7A0] stroke-[1.5]" />
          <h3 className="font-serif text-xl font-medium">You don't have any study subjects yet</h3>
          <p className="text-xs opacity-70 max-w-sm">
            Create a subject (e.g. Mathematics, Literature, Biology) to organize your chapters and
            to-do lists.
          </p>
          <button
            onClick={() => setIsNewSubjectModalOpen(true)}
            className="mt-2 px-5 py-2 rounded-xl bg-[#657B68] text-white text-xs font-medium hover:bg-[#516354] shadow-xs cursor-pointer"
          >
            + Create Subject
          </button>
        </div>
      )}

      {/* Deterministic Unstructured Notes Parser Modal */}
      {isParserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-xl border flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
              isDark
                ? "bg-[#23201d] border-stone-700 text-stone-100"
                : "bg-[#F6F3EB] border-[#A8B7A0]/50 text-[#514A43]"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#657B68]" />
                <h3 className="font-serif text-2xl font-normal">Paste Unstructured Notes</h3>
              </div>
              <p className="text-xs opacity-70 font-light mt-1">
                Paste chapters, syllabus, or handwritten study bullet points. Our deterministic
                parser will automatically organize them into chapters, topics, durations, and
                subtasks.
              </p>
            </div>

            <textarea
              rows={6}
              placeholder={`Chapter 1: Network Layer\nIP addressing 30m\n  Subnet masks\n  CIDR notation\nForwarding\nRouting algorithms\nRevise Chapter 2 45m`}
              value={rawTextNotes}
              onChange={(e) => handleParseInput(e.target.value)}
              className={`w-full p-3.5 rounded-2xl font-mono text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                isDark
                  ? "bg-stone-900 border-stone-700 text-stone-100"
                  : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
              }`}
            />

            {/* Parsed Preview */}
            {previewParsed.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-serif font-medium text-[#657B68]">
                  Parsed Preview ({previewParsed.length} topics detected):
                </span>
                <div
                  className={`max-h-44 overflow-y-auto rounded-2xl border p-3 flex flex-col gap-2 ${
                    isDark ? "bg-stone-900/80 border-stone-800" : "bg-white/90 border-[#A8B7A0]/30"
                  }`}
                >
                  {previewParsed.map((p, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex items-center justify-between border-b border-stone-500/15 pb-1"
                    >
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {p.chapter && (
                          <span className="text-[10px] text-[#657B68] ml-2">({p.chapter})</span>
                        )}
                        {p.subtopics.length > 0 && (
                          <span className="text-[10px] opacity-50 ml-2">
                            +{p.subtopics.length} subtasks
                          </span>
                        )}
                      </div>
                      {p.estimatedMinutes && (
                        <span className="text-[10px] opacity-70">{p.estimatedMinutes}m</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-stone-500/20">
              <button
                onClick={() => setIsParserModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                disabled={previewParsed.length === 0}
                onClick={handleApplyParsedNotes}
                className="px-5 py-2 rounded-xl bg-[#657B68] hover:bg-[#516354] disabled:opacity-40 text-white text-xs font-medium shadow-xs"
              >
                Import {previewParsed.length} Topics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Subject Modal */}
      {isNewSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateSubject}
            className={`w-full max-w-md rounded-3xl p-6 shadow-xl border flex flex-col gap-4 ${
              isDark
                ? "bg-[#23201d] border-stone-700 text-stone-100"
                : "bg-[#F6F3EB] border-[#A8B7A0]/50 text-[#514A43]"
            }`}
          >
            <h3 className="font-serif text-xl font-normal">Add a new study subject</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-80">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Molecular Genetics, Topology"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className={`px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#657B68] ${
                  isDark
                    ? "bg-stone-900 border-stone-700 text-stone-100"
                    : "bg-white border-[#A8B7A0]/40 text-[#514A43]"
                }`}
                autoFocus
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-80">Palette Accent</label>
              <div className="flex gap-2.5">
                {(["sage", "forest", "blue", "peach"] as const).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewSubjectColor(color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs capitalize ${
                      newSubjectColor === color
                        ? "border-[#657B68] bg-[#657B68]/15 font-medium"
                        : "border-stone-500/25 bg-stone-500/5"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        color === "forest"
                          ? "bg-emerald-500"
                          : color === "blue"
                            ? "bg-sky-500"
                            : color === "peach"
                              ? "bg-amber-400"
                              : "bg-stone-400"
                      }`}
                    />
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 pt-3 border-t border-stone-500/20">
              <button
                type="button"
                onClick={() => setIsNewSubjectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#657B68] hover:bg-[#516354] text-white text-xs font-medium shadow-xs"
              >
                Create Subject
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
