import { describe, it, expect } from "vitest";
import { parseStudyNotes } from "../lib/topic-parser";

describe("Deterministic Topic Parser", () => {
  it("parses chapters, list items, and indentation correctly", () => {
    const rawInput = `Chapter 3: Network Layer
IP addressing
  Subnet masks (30m)
  CIDR notation
Subnetting
Forwarding
Routing algorithms
  Distance vector
  Link state
Revise Chapter 2 45m`;

    const result = parseStudyNotes(rawInput);

    expect(result.chapterCount).toBe(1);
    expect(result.topics.length).toBe(5);

    // Topic 1: IP addressing
    expect(result.topics[0].name).toBe("IP addressing");
    expect(result.topics[0].chapter).toBe("Chapter 3: Network Layer");
    expect(result.topics[0].subtopics).toEqual(["Subnet masks", "CIDR notation"]);
    expect(result.topics[0].estimatedMinutes).toBe(30);

    // Topic 2: Subnetting
    expect(result.topics[1].name).toBe("Subnetting");

    // Topic 4: Routing algorithms
    expect(result.topics[3].name).toBe("Routing algorithms");
    expect(result.topics[3].subtopics).toEqual(["Distance vector", "Link state"]);

    // Topic 5: Revise Chapter 2 with duration
    expect(result.topics[4].name).toBe("Revise Chapter 2");
    expect(result.topics[4].estimatedMinutes).toBe(45);
  });

  it("handles bullet points, numbered lists, and multiple chapters", () => {
    const raw = `
Chapter 1: Organic Chemistry
1. Alkanes & Cycloalkanes
2. Alkyl Halides
   - Substitution reactions
   - Elimination reactions

Chapter 2: Thermodynamics
* Enthalpy
* Entropy (1h)
`;

    const result = parseStudyNotes(raw);
    expect(result.chapterCount).toBe(2);
    expect(result.topics.length).toBe(4);

    expect(result.topics[0].name).toBe("Alkanes & Cycloalkanes");
    expect(result.topics[0].chapter).toBe("Chapter 1: Organic Chemistry");

    expect(result.topics[1].name).toBe("Alkyl Halides");
    expect(result.topics[1].subtopics).toEqual(["Substitution reactions", "Elimination reactions"]);

    expect(result.topics[2].chapter).toBe("Chapter 2: Thermodynamics");
    expect(result.topics[3].name).toBe("Entropy");
    expect(result.topics[3].estimatedMinutes).toBe(60);
  });
});
