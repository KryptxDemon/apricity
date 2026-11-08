# Build "Meanwhile" — A Beautiful Collaborative Study Companion

Build a fully functional, aesthetically refined, collaborative study-planning web application called **Meanwhile**.

### Concept

Meanwhile is a shared space for people who study, work, or pursue personal goals from different places.

Two friends, partners, or study companions can create their own task lists, organize topics, track each other's progress in real time, and gently encourage one another.

The emotional premise is:

_"For the things we're learning, and the people we're learning alongside."_

This should NOT look like a conventional productivity SaaS, generic AI-generated dashboard, Notion clone, or corporate task management tool.

The experience should feel like opening a beautifully illustrated personal journal, a quiet little corner of the internet, or a literary book with interactive elements.

## 1. Design Direction — Quiet Editorial

The aesthetic is the most important part of this project.

Create an original, cohesive design system inspired by:

- Literary editorial design
- Japanese stationery
- Watercolor landscape illustrations
- Cozy illustrated environments
- Vintage botanical books
- Personal journals and postcards
- Calm, intimate digital experiences

### Visual language

Color palette:

- Warm paper cream: #F6F3EB
- Soft sage: #A8B7A0
- Muted forest: #657B68
- Dusty blue: #A8BBCB
- Faded peach: #E8C9B9
- Ink brown: #514A43

Typography:

- Elegant serif typography for titles and emotional copy.
- A clean, understated sans-serif for UI elements.
- Use typography intentionally, with editorial hierarchy.
- Avoid oversized bold headings and excessive capitalization.

Use fonts such as DM Serif Display, Cormorant Garamond, Lora, or a similar literary serif. Pair with DM Sans or Manrope.

### Avoid

- Purple AI gradients
- Glassmorphism
- Excessive rounded cards
- Generic dashboard layouts
- Oversized statistics
- Corporate illustrations
- Emoji-heavy interfaces
- Excessive shadows
- Overly childish cartoon visuals
- Generic AI-generated microcopy
- Unnecessary animations
- Every element looking like a floating card

The interface must feel art-directed by a human designer.

## 2. Background Scenery

Create beautiful ambient environments that are integrated into the application.

The backgrounds should feature original or properly licensed illustrations, preferably optimized WebP images.

Available environments:

- A rainy afternoon beside a window
- A peaceful countryside at dusk
- A little garden in spring
- A cloudy seaside
- A quiet library
- A dreamy starry night

Make the scenery selectable from a subtle settings menu.

The scenery should occupy the background without reducing readability. Use subtle overlays where necessary.

Implement gentle ambient animations:

- Slowly drifting clouds
- Subtle falling rain in the rainy environment
- Very subtle ambient movement
- Smooth transitions when switching scenes

Animations should be restrained, lightweight, and respect the user's reduced-motion preference.

Do not use random stock photos. The application should have a cohesive illustrated art direction.

## 3. Main Application Layout

Create a responsive application with the following structure.

### Desktop

A minimal navigation rail or sidebar containing:

- Meanwhile wordmark
- Our little space
- My notebook
- Their notebook
- Quiet room
- Little journal
- Settings

The main content area should be spacious and editorial.

### Mobile

Create a mobile-first responsive layout:

- Compact header
- Scenery remains visible
- Comfortable touch targets
- Bottom navigation or an elegant compact navigation system
- No horizontal overflow

## 4. Shared Home — The Main Dashboard

This is the primary screen.

At the top:

"Sunday, November 8"

A small serif greeting:

"Good afternoon. How's your little world?"

Show both connected users with their names, avatars, and current study subjects.

Example:

ASIF
Currently with Computer Networks

MOWMEE
Currently with Organic Chemistry

Include subtle presence indicators:

- Studying now
- Taking a little break
- Away

Presence should be optional and should not expose unnecessary personal information.

### Shared progress

Display each person's study progress in a visually elegant manner.

Example:

ASIF
4 of 8 topics completed

MOWMEE
6 of 10 topics completed

Use delicate progress indicators, not giant progress bars or gamified scores.

### Today's study lists

Show each person's current subjects and their topics.

The lists should be accessible directly from the home screen.

When either user completes a topic, the other person's screen should update in real time.

Include a subtle activity section with literary microcopy such as:

"Meanwhile, she finished Carboxylic Acids."

"Three little things crossed off today."

Avoid generic motivational slogans.

## 5. Study Notebook — Core Functionality

Users should be able to create and manage:

- Subjects
- Chapters
- Topics
- Subtopics
- Study sessions

Each topic should have:

- Name
- Optional description
- Completion status
- Optional estimated duration
- Optional chapter grouping
- Completion timestamp

The interface should resemble an elegant handwritten study notebook.

### Topic input

Create a beautiful input area with placeholder text:

"What's on your mind to study today?"

Users should be able to paste unstructured text.

Example input:

Chapter 3: Network Layer
IP addressing
Subnetting
Forwarding
Routing algorithms
Distance vector
Link state
Revise Chapter 2

The application should intelligently organize this into a structured list with appropriate chapter headings and checkboxes.

### Topic organization logic

Use a deterministic parser by default.

- Separate lines become topics.
- Numbered items become ordered topics.
- Bullet points become individual topics.
- Chapter headings become parent groups.
- Indented items become subtasks.

Include an optional "Organize my notes" feature using an AI integration if available.

The AI should:

- Preserve the original meaning.
- Never invent topics.
- Return structured data.
- Allow users to preview and edit before saving.

If AI integration is unavailable, implement the parser without AI. Do not make the feature a nonfunctional placeholder.

## 6. Collaboration and Real-Time Synchronization

This is a collaborative application, not two separate personal planners.

Implement:

- User authentication
- Private partner connections
- Invitation links or invitation codes
- Shared study space
- Real-time topic completion updates
- Shared progress visibility
- Partner's current study subject
- Activity updates

Use Supabase for authentication, PostgreSQL storage, and real-time synchronization.

Create proper database relationships.

Suggested tables:

- profiles
- partnerships
- study_sessions
- subjects
- topics
- topic_progress
- pokes
- notes
- activity_events

Implement appropriate Row Level Security policies.

Only connected users should be able to view the shared study space.

Users should be able to disconnect from a partnership.

Do not use localStorage as the primary database for collaborative functionality.

If Supabase credentials are not configured, create a polished demo mode with realistic sample data and clearly separate it from the production authentication flow.

## 7. Cute Interactions

Implement a small set of delightful, understated interactions.

### Poke

A user can send a gentle poke to their study companion.

Possible messages:

- "A little bird tells me it's study time."
- "Meanwhile, someone is waiting for you."
- "A gentle nudge from your little corner of the world."
- "Come back when you're ready."

Create a subtle notification animation.

Allow users to customize poke messages.

Avoid aggressive reminders or pressure.

### Leave a note

Allow one person to leave a short note on a completed topic.

Example:

"Finally understood this one. Thought you'd be proud."

Notes should be optional and editable.

### Completion interaction

When a topic is checked:

- Animate the checkbox subtly.
- Update progress immediately.
- Synchronize with the partner.
- Show a small, tasteful completion acknowledgment.

Avoid confetti and loud celebratory animations.

### Presence

Show a small indication of whether the partner is studying, taking a break, or away.

Keep this unobtrusive.

## 8. Quiet Room — Shared Focus Mode

Create a distraction-free study environment.

Features:

- Ambient illustrated scenery
- Minimal focus timer
- Current study topic
- Optional shared session
- Subtle partner presence
- Start, pause, and end session controls

The timer should support:

- 25-minute focus
- 50-minute focus
- Custom duration

The design should feel peaceful.

No large dashboards or excessive timer controls.

## 9. Little Journal

Create an elegant activity journal.

Display:

- Completed topics
- Shared study sessions
- Small daily milestones
- Notes exchanged
- Days when both users studied

Present the activity as a beautiful chronological journal rather than a conventional analytics dashboard.

Example:

Sunday, November 8

ASIF
Finished Routing Algorithms

MOWMEE
Finished Aldehydes & Ketones

A little progress, in two different worlds.

Do not implement competitive leaderboards, streak pressure, or productivity scoring.

## 10. Interaction Quality

Every interactive element must work.

Implement:

- Functional checkboxes
- Working navigation
- Working subject creation
- Working topic creation
- Topic editing and deletion
- Functional invitations
- Functional partner connection
- Functional poke system
- Real-time updates
- Responsive settings
- Background selection
- Loading states
- Empty states
- Error handling
- Confirmation dialogs where appropriate

Do not create decorative buttons that do nothing.

Use subtle transitions and meaningful feedback.

## 11. Technical Requirements

Use:

- React
- TypeScript
- Tailwind CSS
- Supabase
- Motion for animations
- Lucide icons

Keep the code modular and maintainable.

Use reusable components for:

- Topic lists
- Study subjects
- Progress indicators
- Presence indicators
- Poke notifications
- Background scenery
- Journal entries

Optimize for performance.

Use lazy loading for scenery images.

Ensure accessibility, keyboard navigation, and sufficient text contrast.

## 12. Final Design Quality

The application should feel like a finished, carefully art-directed product.

Focus on:

- Visual consistency
- Elegant spacing
- Typography
- Beautiful illustrations
- A cohesive color palette
- Subtle interactions
- Thoughtful microcopy
- A sense of warmth and intimacy

The app should be beautiful even when the user has no tasks.

Empty states should feel intentional rather than unfinished.

Examples:
"No little tasks here yet. Perhaps tomorrow?"

"The page is still waiting for your first chapter."

"Your little corner is ready."

Do not use placeholder Lorem Ipsum.

Do not build a generic SaaS dashboard.

Do not prioritize feature quantity over aesthetic quality.

**The final experience should feel like a beautifully illustrated shared journal for two people growing in their own worlds, together.**
