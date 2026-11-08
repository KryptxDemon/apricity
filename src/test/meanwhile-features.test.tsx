import { describe, it, expect, beforeEach } from "vitest";
import { parseStudyNotes } from "../lib/topic-parser";
import { createDefaultSpace } from "../lib/initial-data";
import type { UserProfile } from "../types/meanwhile";

describe("apricity Collaboration & Parser Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a clean 10-person collaboration space for a newly logged-in user", () => {
    const testUser: UserProfile = {
      id: "user-test-1",
      name: "Asif",
      avatarSeed: "leaf",
      currentSubject: "Computer Networks",
      presence: "studying",
      scenery: "rainy-window",
    };

    const space = createDefaultSpace(testUser);
    expect(space.maxMembers).toBe(10);
    expect(space.members.length).toBe(1);
    expect(space.members[0].name).toBe("Asif");
    expect(space.members[0].isHost).toBe(true);
    expect(space.code).toMatch(/^APR-[A-Z0-9]+$/);
    expect(space.quote.author).toBeDefined();
  });

  it("correctly parses unstructured study notes with chapters and durations", () => {
    const syllabus = `
Chapter 4: Transport Layer
TCP 3-way handshake 30m
  SYN flag
  ACK response
Congestion control 45m
UDP stateless datagrams 20m
`;
    const result = parseStudyNotes(syllabus);
    expect(result.topics.length).toBe(3);
    expect(result.topics[0].name).toBe("TCP 3-way handshake");
    expect(result.topics[0].chapter).toBe("Chapter 4: Transport Layer");
    expect(result.topics[0].estimatedMinutes).toBe(30);
    expect(result.topics[0].subtopics).toEqual(["SYN flag", "ACK response"]);
    expect(result.topics[1].estimatedMinutes).toBe(45);
    expect(result.topics[2].estimatedMinutes).toBe(20);
    expect(result.totalEstimatedMinutes).toBe(95);
  });
});
