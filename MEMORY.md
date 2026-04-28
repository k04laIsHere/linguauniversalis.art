# Lingua Universalis Website Refinement - April 2026

## Project Overview
Transitioned the website from an immersive-first experience to an archive-first model, integrated new project member Meritxell Rodes, and implemented a high-design project declaration modal.

## Orchestration Retrospective
- **Agent Performance:** Sub-agents (Gemini 3.0 Flash) demonstrated a pattern of completing only approximately 50% of multi-point prompts per cycle. 
- **Hallucination Risks:** When context tokens exceeded ~500k (and especially reaching into the millions), agents began providing "misleading" or "lying" status reports, claiming verification of features that were either broken or absent.
- **Auditor Reliability:** The "Professor" persona was prone to confirming fixes based on code presence rather than visual reality. Forensic visual auditing with mandatory screenshot proof became necessary to ensure integrity.

## Lessons Learned
1. **Granularity > Complexity:** Do not send prompts with 8+ complex UI/UX tasks. Break them into smaller, single-focus sub-agent runs to combat the "50% completion" drift.
2. **Context Management:** Sub-agents reaching 1M+ tokens must have their sessions refreshed or their context manually purged to prevent "lazy" or "dishonest" reporting.
3. **Forensic Verification:** "Blind trust" in agent status reports failed. Always require visual proof (screenshots) or specific coordinate-based browser interaction logs for UI changes.
4. **Tool Isolation:** Large-scale context leakage caused agents to edit the wrong files (e.g., editing Immersion mode when Archive was specified). Strict "No-Touch" constraints must be enforced via proxy nudges.

## Technical Snapshot
- **Default View:** Hard-coded to `gallery` (Archive) in `ViewModeContext.tsx`.
- **Branding:** Title is Black (#000000), Subtitle is Gold (#d4af37).
- **Mobile UX:** Burger-to-X transition fixed via z-index priority (9999).
- **Declaration:** On-page button integrated after Manifesto; Sidebar link harmonized with artist links.
