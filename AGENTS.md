# Meanwhile — Architecture Guidelines

## App Architecture

- Keep Meanwhile's collaboration data in Supabase tables protected by partnership-aware row policies, because partner notebooks and activity must be private to the connected pair.
- Keep topic parsing as a deterministic client-safe utility and test its chapter, list, and indentation rules, because the core notebook flow must work without an AI service.
- Maintain the quiet editorial design system: warm paper palette (#F6F3EB, #A8B7A0, #657B68, #A8BBCB, #E8C9B9, #514A43), literary serif typography, and calm, non-gamified interactions.
