export interface ParsedTopic {
  id: string;
  name: string;
  chapter: string;
  description: string;
  estimatedMinutes?: number;
  subtopics: string[];
}

export interface ParseResult {
  topics: ParsedTopic[];
  chapterCount: number;
  totalEstimatedMinutes: number;
}

/**
 * Extracts estimated duration like "45m", "30 mins", "1.5h", "2 hours"
 */
function extractDuration(text: string): { cleanText: string; durationMinutes?: number } {
  // Regex to detect duration patterns
  const durationRegex = /\b(?:(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)|(\d+)\s*(?:minutes?|mins?|m))\b/i;
  const match = text.match(durationRegex);

  if (!match) {
    return { cleanText: text.trim() };
  }

  let minutes = 0;
  if (match[1]) {
    minutes = Math.round(parseFloat(match[1]) * 60);
  } else if (match[2]) {
    minutes = parseInt(match[2], 10);
  }

  // Remove duration from title text
  const cleanText = text
    .replace(match[0], "")
    .replace(/\(\s*\)|\[\s*\]/g, "")
    .replace(/[-–—]\s*$/, "")
    .trim();

  return {
    cleanText: cleanText || text.trim(),
    durationMinutes: minutes > 0 && minutes <= 600 ? minutes : undefined,
  };
}

/**
 * Checks if a line is a chapter heading
 */
function isChapterHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // e.g. "Chapter 1", "Chapter 3: Network Layer", "Unit 2: Kinetics", "Section A", "Part I"
  if (/^(chapter|unit|section|module|part|ch\.)\s+\d+/i.test(trimmed)) {
    return true;
  }

  // Heading ending with colon if short enough and not a list
  if (trimmed.endsWith(":") && trimmed.length < 60 && !/^[-*•\d]/.test(trimmed)) {
    return true;
  }

  // Markdown-style heading: "# Chapter 1" or "## Topic"
  if (/^#{1,3}\s+/.test(trimmed)) {
    return true;
  }

  return false;
}

function cleanChapterTitle(line: string): string {
  return line
    .trim()
    .replace(/^#{1,3}\s+/, "")
    .replace(/:$/, "")
    .trim();
}

/**
 * Clean bullet points or list markers
 */
function cleanBulletOrNumber(line: string): string {
  return line
    .trim()
    .replace(/^[-*•+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

/**
 * Deterministic text parser for study notes
 */
export function parseStudyNotes(input: string, fallbackChapter: string = ""): ParseResult {
  const lines = input.split(/\r?\n/);
  const topics: ParsedTopic[] = [];

  let currentChapter = fallbackChapter;
  let activeTopic: ParsedTopic | null = null;
  const discoveredChapters = new Set<string>();

  if (fallbackChapter) {
    discoveredChapters.add(fallbackChapter);
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    // Check indentation: 2 or more spaces, or a tab
    const indentMatch = rawLine.match(/^(\s+)/);
    const indentLevel = indentMatch ? indentMatch[1].replace(/\t/g, "  ").length : 0;
    const isIndented = indentLevel >= 2;

    if (isChapterHeading(rawLine) && !isIndented) {
      currentChapter = cleanChapterTitle(rawLine);
      discoveredChapters.add(currentChapter);
      activeTopic = null;
      continue;
    }

    const strippedText = cleanBulletOrNumber(rawLine);
    if (!strippedText) continue;

    const { cleanText, durationMinutes } = extractDuration(strippedText);

    if (isIndented && activeTopic) {
      // Indented item belongs as a subtopic of the preceding topic
      activeTopic.subtopics.push(cleanText);
      if (durationMinutes && !activeTopic.estimatedMinutes) {
        activeTopic.estimatedMinutes = durationMinutes;
      }
    } else {
      // Normal top-level topic
      const topicId = `topic-${Date.now()}-${topics.length + 1}-${Math.random().toString(36).slice(2, 6)}`;
      const newTopic: ParsedTopic = {
        id: topicId,
        name: cleanText,
        chapter: currentChapter,
        description: "",
        estimatedMinutes: durationMinutes,
        subtopics: [],
      };
      topics.push(newTopic);
      activeTopic = newTopic;
    }
  }

  const totalMinutes = topics.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  return {
    topics,
    chapterCount: discoveredChapters.size,
    totalEstimatedMinutes: totalMinutes,
  };
}
