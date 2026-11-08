import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type {
  UserProfile,
  SubjectItem,
  TopicItem,
  ActivityEventItem,
  CollaborationSpace,
  CollaborationHistoryRecord,
  PokeItem,
  SceneryId,
  PresenceStatus,
  StudySessionItem,
  AppTheme,
  Collaborator,
  AuthorQuote,
  AmbientSoundTrack,
} from "../types/meanwhile";
import {
  EMPTY_SUBJECTS,
  EMPTY_TOPICS,
  EMPTY_ACTIVITY,
  EMPTY_HISTORY,
  createDefaultSpace,
  FAMOUS_AUTHOR_QUOTES,
} from "../lib/initial-data";
import { ambientSound } from "../lib/audio-ambient";
import { toast } from "sonner";

interface MeanwhileContextValue {
  // Auth & Profile
  currentUser: UserProfile | null;
  loginUser: (user: UserProfile) => void;
  logoutUser: () => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  updatePresence: (presence: PresenceStatus) => void;
  setScenery: (scenery: SceneryId) => void;

  // Theme
  theme: AppTheme;
  toggleTheme: () => void;

  // Background Music for Everyone
  bgMusic: AmbientSoundTrack;
  setBgMusic: (track: AmbientSoundTrack) => void;

  // 10-Person Collaboration Space
  space: CollaborationSpace;
  collaborators: Collaborator[];
  isHost: boolean;
  addCollaborator: (name: string, subject?: string) => void;
  kickCollaborator: (memberId: string) => void;
  renameSpace: (name: string) => void;
  setSpaceQuote: (quote: AuthorQuote) => void;
  diminishSpace: () => void;
  joinSpaceByCode: (code: string) => void;

  // Collaboration History
  collaborationHistory: CollaborationHistoryRecord[];

  // Subjects & Tasks
  subjects: SubjectItem[];
  addSubject: (name: string, color: SubjectItem["color"]) => SubjectItem;
  updateSubject: (id: string, updates: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => void;

  topics: TopicItem[];
  myTopics: TopicItem[];
  toggleTopic: (topicId: string) => void;
  addTopic: (
    subjectId: string,
    name: string,
    chapter?: string,
    estimatedMinutes?: number,
    description?: string,
    targetOwnerId?: string,
    targetOwnerName?: string,
  ) => TopicItem;
  addBulkTopics: (
    subjectId: string,
    parsedTopics: {
      name: string;
      chapter: string;
      estimatedMinutes?: number;
      subtopics: string[];
    }[],
  ) => void;
  updateTopic: (id: string, updates: Partial<TopicItem>) => void;
  deleteTopic: (id: string) => void;
  addNoteToTopic: (topicId: string, body: string) => void;

  // Pokes
  pokes: PokeItem[];
  myUnreadPokes: PokeItem[];
  sendPoke: (recipientId: string, message: string) => void;
  markPokeAsRead: (pokeId: string) => void;

  // Activity & Focus Sessions
  activity: ActivityEventItem[];
  studySessions: StudySessionItem[];
  recordStudySession: (durationMinutes: number, subjectName: string, topicName?: string) => void;
}

const MeanwhileContext = createContext<MeanwhileContextValue | null>(null);

const STORAGE_KEYS = {
  USER: "apricity_user_v3",
  THEME: "apricity_theme_v3",
  SPACE: "apricity_space_v3",
  SUBJECTS: "apricity_subjects_v3",
  TOPICS: "apricity_topics_v3",
  ACTIVITY: "apricity_activity_v3",
  HISTORY: "apricity_history_v3",
  POKES: "apricity_pokes_v3",
  SESSIONS: "apricity_sessions_v3",
  MUSIC: "apricity_music_v3",
};

let syncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("apricity_collab_v3");
  } catch {
    syncChannel = null;
  }
}

export const MeanwhileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme;
      if (saved === "light" || saved === "dark") return saved;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });

  const [bgMusic, setBgMusicState] = useState<AmbientSoundTrack>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.MUSIC) as AmbientSoundTrack;
      if (saved) return saved;
    }
    return "none";
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return null;
  });

  const [space, setSpace] = useState<CollaborationSpace>(() => {
    if (typeof window === "undefined" || !currentUser) {
      return {
        id: "space-default",
        name: "My Study Space",
        code: "APR-START",
        maxMembers: 10,
        hostId: "",
        quote: FAMOUS_AUTHOR_QUOTES[0],
        members: [],
        createdAt: new Date().toISOString(),
      };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SPACE);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return createDefaultSpace(currentUser);
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    if (typeof window === "undefined") return EMPTY_SUBJECTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return EMPTY_SUBJECTS;
  });

  const [topics, setTopics] = useState<TopicItem[]>(() => {
    if (typeof window === "undefined") return EMPTY_TOPICS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TOPICS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return EMPTY_TOPICS;
  });

  const [collaborationHistory, setCollaborationHistory] = useState<CollaborationHistoryRecord[]>(
    () => {
      if (typeof window === "undefined") return EMPTY_HISTORY;
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (raw) return JSON.parse(raw);
      } catch {
        // fallback
      }
      return EMPTY_HISTORY;
    },
  );

  const [activity, setActivity] = useState<ActivityEventItem[]>(() => {
    if (typeof window === "undefined") return EMPTY_ACTIVITY;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return EMPTY_ACTIVITY;
  });

  const [pokes, setPokes] = useState<PokeItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.POKES);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  });

  const [studySessions, setStudySessions] = useState<StudySessionItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  });

  // Background music handler
  const setBgMusic = useCallback((track: AmbientSoundTrack) => {
    setBgMusicState(track);
    ambientSound.play(track);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.MUSIC, track);
    }
  }, []);

  // Theme application
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Sync across tabs
  useEffect(() => {
    if (!syncChannel) return;
    const handleSync = (e: MessageEvent) => {
      const { type, payload } = e.data || {};
      if (type === "STATE_SYNC") {
        if (payload.subjects) setSubjects(payload.subjects);
        if (payload.topics) setTopics(payload.topics);
        if (payload.space) setSpace(payload.space);
        if (payload.activity) setActivity(payload.activity);
      } else if (type === "POKE_RECEIVED" && currentUser) {
        if (payload.recipientId === currentUser.id) {
          toast.message(`Nudge from ${payload.senderName}`, {
            description: payload.message,
          });
          setPokes((prev) => [payload.poke, ...prev]);
        }
      }
    };
    syncChannel.addEventListener("message", handleSync);
    return () => syncChannel?.removeEventListener("message", handleSync);
  }, [currentUser]);

  // Auth methods
  const loginUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    const newSpace = createDefaultSpace(user);
    setSpace(newSpace);

    // Ensure user has at least one subject
    setSubjects((prev) => {
      if (prev.some((s) => s.ownerId === user.id)) return prev;
      const initialSubj: SubjectItem = {
        id: `subj-${Date.now()}`,
        ownerId: user.id,
        name: user.currentSubject || "My Focus",
        color: "forest",
        sortOrder: 1,
      };
      const next = [...prev, initialSubj];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(next));
      }
      return next;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(newSpace));
    }
    toast.success(`Welcome to apricity, ${user.name}`);
  }, []);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    toast.info("Signed out");
  }, []);

  const updateCurrentUser = useCallback(
    (updates: Partial<UserProfile>) => {
      if (!currentUser) return;
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      setSpace((prev) => {
        const nextSpace = {
          ...prev,
          members: prev.members.map((m) =>
            m.id === currentUser.id
              ? {
                  ...m,
                  name: updated.name,
                  currentSubject: updated.currentSubject,
                  presence: updated.presence,
                  avatarSeed: updated.avatarSeed,
                }
              : m,
          ),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(nextSpace));
        }
        return nextSpace;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      }
    },
    [currentUser],
  );

  const updatePresence = useCallback(
    (presence: PresenceStatus) => {
      updateCurrentUser({ presence });
    },
    [updateCurrentUser],
  );

  const setScenery = useCallback(
    (scenery: SceneryId) => {
      updateCurrentUser({ scenery });
    },
    [updateCurrentUser],
  );

  const isHost = Boolean(currentUser && space.hostId === currentUser.id);

  // 10-person Collaboration & Leader Powers
  const addCollaborator = useCallback(
    (name: string, subject?: string) => {
      if (!currentUser) return;
      if (space.members.length >= 10) {
        toast.error("Space has reached maximum 10 collaborators.");
        return;
      }

      const newMember: Collaborator = {
        id: `collab-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: name.trim(),
        avatarSeed: "sprout",
        currentSubject: subject?.trim() || "Active Study",
        presence: "studying",
        joinedAt: new Date().toISOString(),
        isHost: false,
      };

      const updatedMembers = [...space.members, newMember];
      const updatedSpace: CollaborationSpace = { ...space, members: updatedMembers };
      setSpace(updatedSpace);

      const joinEvent: ActivityEventItem = {
        id: `act-${Date.now()}`,
        ownerId: newMember.id,
        ownerName: newMember.name,
        kind: "collaborator_joined",
        subjectName: newMember.currentSubject,
        detail: `${newMember.name} joined the study space.`,
        createdAt: new Date().toISOString(),
      };
      const nextActivity = [joinEvent, ...activity];
      setActivity(nextActivity);

      const historyRecord: CollaborationHistoryRecord = {
        id: `hist-${Date.now()}`,
        roomCode: space.code,
        roomName: space.name,
        collaborators: updatedMembers.map((m) => ({ id: m.id, name: m.name })),
        startedAt: new Date().toISOString(),
        topicsCompletedTogether: 0,
        totalFocusMinutes: 0,
      };
      const nextHistory = [historyRecord, ...collaborationHistory];
      setCollaborationHistory(nextHistory);

      // Create initial companion subject and initial tasks so the partner tasks column is immediately active!
      const companionSubjId = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const companionSubj: SubjectItem = {
        id: companionSubjId,
        ownerId: newMember.id,
        name: newMember.currentSubject || "Study Goals",
        color: "sage",
        sortOrder: 1,
      };
      const companionTask1: TopicItem = {
        id: `topic-${Date.now()}-1`,
        ownerId: newMember.id,
        ownerName: newMember.name,
        subjectId: companionSubjId,
        chapter: "Tasks",
        name: `${newMember.currentSubject || "Study"}: Review notes & summary`,
        completed: false,
        sortOrder: 1,
      };
      const companionTask2: TopicItem = {
        id: `topic-${Date.now()}-2`,
        ownerId: newMember.id,
        ownerName: newMember.name,
        subjectId: companionSubjId,
        chapter: "Tasks",
        name: "Practice problems & exercises",
        completed: false,
        sortOrder: 2,
      };

      const nextSubjects = [...subjects, companionSubj];
      const nextTopics = [...topics, companionTask1, companionTask2];
      setSubjects(nextSubjects);
      setTopics(nextTopics);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(updatedSpace));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(nextActivity));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(nextHistory));
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(nextSubjects));
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(nextTopics));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: {
            space: updatedSpace,
            activity: nextActivity,
            subjects: nextSubjects,
            topics: nextTopics,
          },
        });
      }

      toast.success(`${name} joined your study space (${updatedMembers.length}/10)`);
    },
    [currentUser, space, activity, collaborationHistory, subjects, topics],
  );

  const kickCollaborator = useCallback(
    (memberId: string) => {
      if (!isHost) {
        toast.error("Only the room leader can remove collaborators.");
        return;
      }
      const target = space.members.find((m) => m.id === memberId);
      if (!target || target.isHost) return;

      const updatedMembers = space.members.filter((m) => m.id !== memberId);
      const updatedSpace = { ...space, members: updatedMembers };
      setSpace(updatedSpace);

      const kickEvent: ActivityEventItem = {
        id: `act-${Date.now()}`,
        ownerId: currentUser!.id,
        ownerName: currentUser!.name,
        kind: "space_updated",
        subjectName: space.name,
        detail: `${target.name} left the study space.`,
        createdAt: new Date().toISOString(),
      };
      const nextActivity = [kickEvent, ...activity];
      setActivity(nextActivity);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(updatedSpace));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(nextActivity));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { space: updatedSpace, activity: nextActivity },
        });
      }
      toast.info(`Removed ${target.name} from the space`);
    },
    [isHost, space, activity, currentUser],
  );

  const renameSpace = useCallback(
    (name: string) => {
      if (!isHost) {
        toast.error("Only the room leader can rename the space.");
        return;
      }
      const updatedSpace = { ...space, name: name.trim() || space.name };
      setSpace(updatedSpace);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(updatedSpace));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { space: updatedSpace },
        });
      }
      toast.success(`Study room renamed to "${updatedSpace.name}"`);
    },
    [isHost, space],
  );

  const setSpaceQuote = useCallback(
    (quote: AuthorQuote) => {
      if (!isHost) {
        toast.error("Only the room leader can set the room motivation quote.");
        return;
      }
      const updatedSpace = { ...space, quote };
      setSpace(updatedSpace);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(updatedSpace));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { space: updatedSpace },
        });
      }
      toast.success(`Motivation quote updated (${quote.author})`);
    },
    [isHost, space],
  );

  const diminishSpace = useCallback(() => {
    if (!currentUser) return;
    if (!isHost) {
      toast.error("Only the room leader can reset or diminish this space.");
      return;
    }
    const fresh = createDefaultSpace(currentUser);
    setSpace(fresh);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(fresh));
      syncChannel?.postMessage({
        type: "STATE_SYNC",
        payload: { space: fresh },
      });
    }
    toast.info("Study space has been reset to a fresh private room.");
  }, [currentUser, isHost]);

  const joinSpaceByCode = useCallback(
    (code: string) => {
      if (!currentUser) return;
      const clean = code.trim().toUpperCase();
      const updatedSpace: CollaborationSpace = {
        id: `space-${Date.now()}`,
        name: `Study Space ${clean}`,
        code: clean,
        maxMembers: 10,
        hostId: "remote-host",
        quote: FAMOUS_AUTHOR_QUOTES[0],
        members: [
          ...space.members,
          {
            id: `partner-${Date.now()}`,
            name: "Study Companion",
            avatarSeed: "moon",
            currentSubject: "Study Goals",
            presence: "studying",
            joinedAt: new Date().toISOString(),
          },
        ].slice(0, 10),
        createdAt: new Date().toISOString(),
      };
      setSpace(updatedSpace);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(updatedSpace));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { space: updatedSpace },
        });
      }
      toast.success(`Connected to room ${clean}`);
    },
    [currentUser, space],
  );

  // Subject methods
  const addSubject = useCallback(
    (name: string, color: SubjectItem["color"]) => {
      if (!currentUser) throw new Error("Must be logged in");
      const newSubj: SubjectItem = {
        id: `subj-${Date.now()}`,
        ownerId: currentUser.id,
        name: name.trim(),
        color,
        sortOrder: subjects.length + 1,
      };
      const next = [...subjects, newSubj];
      setSubjects(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(next));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { subjects: next },
        });
      }
      toast.success(`Created subject: ${newSubj.name}`);
      return newSubj;
    },
    [currentUser, subjects],
  );

  const updateSubject = useCallback(
    (id: string, updates: Partial<SubjectItem>) => {
      const next = subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
      setSubjects(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(next));
      }
    },
    [subjects],
  );

  const deleteSubject = useCallback(
    (id: string) => {
      const nextSubjects = subjects.filter((s) => s.id !== id);
      const nextTopics = topics.filter((t) => t.subjectId !== id);
      setSubjects(nextSubjects);
      setTopics(nextTopics);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(nextSubjects));
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(nextTopics));
      }
      toast.info("Subject deleted");
    },
    [subjects, topics],
  );

  // Topic methods
  const myTopics = useMemo(() => {
    if (!currentUser) return [];
    return topics.filter((t) => t.ownerId === currentUser.id);
  }, [topics, currentUser]);

  const toggleTopic = useCallback(
    (topicId: string) => {
      if (!currentUser) return;
      const target = topics.find((t) => t.id === topicId);
      if (!target) return;

      const willBeCompleted = !target.completed;
      const nowIso = new Date().toISOString();

      const nextTopics = topics.map((t) =>
        t.id === topicId
          ? { ...t, completed: willBeCompleted, completedAt: willBeCompleted ? nowIso : undefined }
          : t,
      );
      setTopics(nextTopics);

      let nextActivity = activity;
      if (willBeCompleted) {
        const subject = subjects.find((s) => s.id === target.subjectId);
        const eventDetail = `${currentUser.name} completed: ${target.name}.`;
        const newAct: ActivityEventItem = {
          id: `act-${Date.now()}`,
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          kind: "topic_completed",
          subjectName: subject?.name || "Tasks",
          topicName: target.name,
          detail: eventDetail,
          createdAt: nowIso,
        };
        nextActivity = [newAct, ...activity.slice(0, 49)];
        setActivity(nextActivity);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(nextTopics));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(nextActivity));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { topics: nextTopics, activity: nextActivity },
        });
      }
    },
    [currentUser, topics, subjects, activity],
  );

  const addTopic = useCallback(
    (
      subjectId: string,
      name: string,
      chapter: string = "",
      estimatedMinutes?: number,
      description: string = "",
      targetOwnerId?: string,
      targetOwnerName?: string,
    ) => {
      if (!currentUser) throw new Error("Must be logged in");
      const ownerId = targetOwnerId || currentUser.id;
      const ownerName = targetOwnerName || (targetOwnerId ? targetOwnerName : currentUser.name);

      const newTopic: TopicItem = {
        id: `topic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ownerId,
        ownerName,
        subjectId,
        chapter: chapter.trim() || "Tasks",
        name: name.trim(),
        description: description.trim(),
        estimatedMinutes,
        completed: false,
        sortOrder: topics.length + 1,
      };

      const next = [...topics, newTopic];
      setTopics(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(next));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { topics: next },
        });
      }
      toast.success(`Task added: ${newTopic.name}`);
      return newTopic;
    },
    [currentUser, topics],
  );

  const addBulkTopics = useCallback(
    (
      subjectId: string,
      parsedTopics: {
        name: string;
        chapter: string;
        estimatedMinutes?: number;
        subtopics: string[];
      }[],
    ) => {
      if (!currentUser) return;
      const created: TopicItem[] = parsedTopics.map((pt, idx) => ({
        id: `topic-${Date.now()}-${idx}`,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        subjectId,
        chapter: pt.chapter.trim() || "Tasks",
        name: pt.name.trim(),
        description: "",
        estimatedMinutes: pt.estimatedMinutes,
        completed: false,
        sortOrder: topics.length + idx + 1,
        subtopics: pt.subtopics.map((st, sidx) => ({
          id: `sub-${Date.now()}-${idx}-${sidx}`,
          name: st,
          completed: false,
        })),
      }));

      const next = [...topics, ...created];
      setTopics(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(next));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { topics: next },
        });
      }
      toast.success(`Added ${created.length} tasks!`);
    },
    [currentUser, topics],
  );

  const updateTopic = useCallback(
    (id: string, updates: Partial<TopicItem>) => {
      const next = topics.map((t) => (t.id === id ? { ...t, ...updates } : t));
      setTopics(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(next));
      }
    },
    [topics],
  );

  const deleteTopic = useCallback(
    (id: string) => {
      const next = topics.filter((t) => t.id !== id);
      setTopics(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(next));
      }
      toast.info("Task removed");
    },
    [topics],
  );

  const addNoteToTopic = useCallback(
    (topicId: string, body: string) => {
      if (!currentUser || !body.trim()) return;
      const target = topics.find((t) => t.id === topicId);
      const newNote = {
        id: `note-${Date.now()}`,
        topicId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };
      const nextTopics = topics.map((t) =>
        t.id === topicId ? { ...t, notes: [...(t.notes || []), newNote] } : t,
      );
      setTopics(nextTopics);

      const subject = subjects.find((s) => s.id === target?.subjectId);
      const newAct: ActivityEventItem = {
        id: `act-${Date.now()}`,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        kind: "note_added",
        subjectName: subject?.name || "Notes",
        topicName: target?.name,
        detail: `${currentUser.name} noted on ${target?.name || "a task"}: "${body.slice(0, 50)}"`,
        createdAt: new Date().toISOString(),
      };
      const nextAct = [newAct, ...activity.slice(0, 49)];
      setActivity(nextAct);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(nextTopics));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(nextAct));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { topics: nextTopics, activity: nextAct },
        });
      }
      toast.success("Note saved");
    },
    [currentUser, topics, subjects, activity],
  );

  // Pokes
  const myUnreadPokes = useMemo(() => {
    if (!currentUser) return [];
    return pokes.filter((p) => p.recipientId === currentUser.id && !p.read);
  }, [pokes, currentUser]);

  const sendPoke = useCallback(
    (recipientId: string, message: string) => {
      if (!currentUser) return;
      const target = space.members.find((m) => m.id === recipientId);
      const poke: PokeItem = {
        id: `poke-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        recipientId,
        message: message.trim(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      const nextPokes = [poke, ...pokes.slice(0, 20)];
      setPokes(nextPokes);

      const newAct: ActivityEventItem = {
        id: `act-${Date.now()}`,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        kind: "poke_sent",
        subjectName: "apricity",
        detail: `${currentUser.name} nudged ${target?.name || "a companion"}.`,
        createdAt: new Date().toISOString(),
      };
      const nextAct = [newAct, ...activity.slice(0, 49)];
      setActivity(nextAct);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.POKES, JSON.stringify(nextPokes));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(nextAct));
        syncChannel?.postMessage({
          type: "POKE_RECEIVED",
          payload: {
            recipientId,
            senderName: currentUser.name,
            message: message.trim(),
            poke,
          },
        });
      }
      toast.success(`Nudge sent to ${target?.name || "companion"}`);
    },
    [currentUser, space.members, pokes, activity],
  );

  const markPokeAsRead = useCallback(
    (pokeId: string) => {
      const next = pokes.map((p) => (p.id === pokeId ? { ...p, read: true } : p));
      setPokes(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.POKES, JSON.stringify(next));
      }
    },
    [pokes],
  );

  // Focus sessions
  const recordStudySession = useCallback(
    (durationMinutes: number, subjectName: string, topicName?: string) => {
      if (!currentUser) return;
      const session: StudySessionItem = {
        id: `sess-${Date.now()}`,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        subjectName,
        topicName,
        durationMinutes,
        startedAt: new Date(Date.now() - durationMinutes * 60000).toISOString(),
        endedAt: new Date().toISOString(),
      };

      const nextSessions = [session, ...studySessions];
      setStudySessions(nextSessions);

      const newAct: ActivityEventItem = {
        id: `act-${Date.now()}`,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        kind: "session_completed",
        subjectName,
        topicName,
        detail: `${currentUser.name} finished a ${durationMinutes}-minute focus session.`,
        createdAt: new Date().toISOString(),
      };
      const nextAct = [newAct, ...activity.slice(0, 49)];
      setActivity(nextAct);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(nextSessions));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(nextAct));
        syncChannel?.postMessage({
          type: "STATE_SYNC",
          payload: { activity: nextAct },
        });
      }
      toast.success(`Completed ${durationMinutes} minutes of focus`);
    },
    [currentUser, studySessions, activity],
  );

  const value = useMemo<MeanwhileContextValue>(
    () => ({
      currentUser,
      loginUser,
      logoutUser,
      updateCurrentUser,
      updatePresence,
      setScenery,
      theme,
      toggleTheme,
      bgMusic,
      setBgMusic,
      space,
      collaborators: space.members,
      isHost,
      addCollaborator,
      kickCollaborator,
      renameSpace,
      setSpaceQuote,
      diminishSpace,
      joinSpaceByCode,
      collaborationHistory,
      subjects,
      addSubject,
      updateSubject,
      deleteSubject,
      topics,
      myTopics,
      toggleTopic,
      addTopic,
      addBulkTopics,
      updateTopic,
      deleteTopic,
      addNoteToTopic,
      pokes,
      myUnreadPokes,
      sendPoke,
      markPokeAsRead,
      activity,
      studySessions,
      recordStudySession,
    }),
    [
      currentUser,
      loginUser,
      logoutUser,
      updateCurrentUser,
      updatePresence,
      setScenery,
      theme,
      toggleTheme,
      bgMusic,
      setBgMusic,
      space,
      isHost,
      addCollaborator,
      kickCollaborator,
      renameSpace,
      setSpaceQuote,
      diminishSpace,
      joinSpaceByCode,
      collaborationHistory,
      subjects,
      addSubject,
      updateSubject,
      deleteSubject,
      topics,
      myTopics,
      toggleTopic,
      addTopic,
      addBulkTopics,
      updateTopic,
      deleteTopic,
      addNoteToTopic,
      pokes,
      myUnreadPokes,
      sendPoke,
      markPokeAsRead,
      activity,
      studySessions,
      recordStudySession,
    ],
  );

  return <MeanwhileContext.Provider value={value}>{children}</MeanwhileContext.Provider>;
};

export function useMeanwhile() {
  const context = useContext(MeanwhileContext);
  if (!context) {
    throw new Error("useMeanwhile must be used within a MeanwhileProvider");
  }
  return context;
}
