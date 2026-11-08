import type {
  UserProfile,
  SubjectItem,
  TopicItem,
  ActivityEventItem,
  CollaborationSpace,
  CollaborationHistoryRecord,
  AuthorQuote,
} from "../types/meanwhile";

export const EMPTY_SUBJECTS: SubjectItem[] = [];
export const EMPTY_TOPICS: TopicItem[] = [];
export const EMPTY_ACTIVITY: ActivityEventItem[] = [];
export const EMPTY_HISTORY: CollaborationHistoryRecord[] = [];

export const FAMOUS_AUTHOR_QUOTES: AuthorQuote[] = [
  {
    author: "Albert Camus",
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
  },
  {
    author: "Virginia Woolf",
    text: "No need to hurry. No need to sparkle. No need to be anybody but oneself.",
  },
  {
    author: "Ralph Waldo Emerson",
    text: "Adopt the pace of nature: her secret is patience.",
  },
  {
    author: "Marcus Aurelius",
    text: "The soul becomes dyed with the color of its thoughts.",
  },
  {
    author: "James Clear",
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
  },
  {
    author: "Henry David Thoreau",
    text: "It is not enough to be busy. The question is: What are we busy about?",
  },
  {
    author: "Maya Angelou",
    text: "You can't use up creativity. The more you use, the more you have.",
  },
  {
    author: "Franz Kafka",
    text: "Follow your most intense obsessions mercilessly.",
  },
];

export function createDefaultSpace(user: UserProfile): CollaborationSpace {
  return {
    id: `space-${Date.now()}`,
    name: `${user.name}'s Study Room`,
    code: `APR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    maxMembers: 10,
    hostId: user.id,
    quote: FAMOUS_AUTHOR_QUOTES[0],
    members: [
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarSeed: user.avatarSeed,
        currentSubject: user.currentSubject,
        presence: user.presence,
        joinedAt: new Date().toISOString(),
        isHost: true,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
