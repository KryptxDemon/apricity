export type SceneryId =
  | "rainy-window"
  | "countryside-dusk"
  | "spring-garden"
  | "cloudy-seaside"
  | "quiet-library"
  | "starry-night";

export type PresenceStatus = "studying" | "break" | "away";

export type AppTheme = "light" | "dark";

export type AmbientSoundTrack = "none" | "rain" | "library" | "night" | "cafe";

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarSeed: "leaf" | "quill" | "cup" | "book" | "moon" | "sprout";
  currentSubject: string;
  presence: PresenceStatus;
  scenery: SceneryId;
  studyQuote?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email?: string;
  avatarSeed: "leaf" | "quill" | "cup" | "book" | "moon" | "sprout";
  currentSubject: string;
  presence: PresenceStatus;
  joinedAt: string;
  isHost?: boolean;
}

export interface AuthorQuote {
  text: string;
  author: string;
}

export interface CollaborationHistoryRecord {
  id: string;
  roomCode: string;
  roomName: string;
  collaborators: { id: string; name: string }[];
  startedAt: string;
  endedAt?: string;
  topicsCompletedTogether: number;
  totalFocusMinutes: number;
}

export interface SubjectItem {
  id: string;
  ownerId: string;
  name: string;
  color: "sage" | "forest" | "blue" | "peach";
  sortOrder: number;
}

export interface TopicItem {
  id: string;
  ownerId: string;
  ownerName?: string;
  subjectId: string;
  chapter: string;
  name: string;
  description?: string;
  estimatedMinutes?: number;
  completed: boolean;
  completedAt?: string;
  sortOrder: number;
  subtopics?: { id: string; name: string; completed: boolean }[];
  notes?: NoteItem[];
}

export interface NoteItem {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface StudySessionItem {
  id: string;
  ownerId: string;
  ownerName: string;
  subjectName: string;
  topicName?: string;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
}

export interface PokeItem {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ActivityEventItem {
  id: string;
  ownerId: string;
  ownerName: string;
  kind:
    | "topic_completed"
    | "session_completed"
    | "note_added"
    | "poke_sent"
    | "collaborator_joined"
    | "space_updated";
  subjectName: string;
  topicName?: string;
  detail: string;
  createdAt: string;
}

export interface CollaborationSpace {
  id: string;
  name: string;
  code: string;
  maxMembers: 10;
  hostId: string;
  quote: AuthorQuote;
  members: Collaborator[];
  createdAt: string;
}
