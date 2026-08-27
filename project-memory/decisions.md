# Architectural Decisions

## ADR 001: Markdown-Based State Persistence

**Date:** 2026-04-25
**Context:** Need a lightweight, persistent memory system for multiple AI agents to collaborate without a complex database.
**Decision:** Use a `/project-memory/` directory with structured Markdown files. Agents will read/write to these files to maintain context.
**Consequences:** Easy version control via Git. Simple for LLMs to parse and update. Requires strict adherence to update rules by the AI Project Manager.

## ADR 002: Global Zustand Store for Simulations

**Date:** 2026-04-25
**Context:** The portfolio needs to handle high-fidelity interactive system design simulations (Token Bucket, LSM Tree, Consistent Hashing).
**Decision:** Implement a centralized Zustand store (`src/lib/store.ts`) separating global toggle states from specific algorithm slice states (like TokenBucketState). An interval loop is configured for active real-time logic (e.g., token refilling).
**Consequences:** The frontend components remain purely UI-focused and subscribe to state changes. The Solution Architect controls the core algorithmic logic within the store.
