# Agent Orchestration Plan

## 1. Architecture: The Coordinator Model
I (the main agent) will act as the **Orchestrator**. I will spawn specialized sub-agents for development and testing.

### Roles:
- **Developer Agents:** One per task. Responsible for implementing the logic and styles.
- **Auditor Agent:** Specialized in UX/UI and technical verification. Uses the browser tool/screenshots to validate implementation against the design intent.

## 2. The Watchdog Hook (Heartbeat Logic)
I will implement a persistent monitoring loop using a background script and `HEARTBEAT.md`.

### Mechanism:
- **State Tracking:** A `subagents/state.json` file will track task assignments, timestamps, and status (Developing, Ready for Audit, Auditing, Fixing, Completed).
- **Check-in Script:** A Node.js script (`scripts/watchdog.mjs`) will run via `cron` or a persistent `process`. It will:
    - Check the `subagents/state.json`.
    - If an agent hasn't updated its progress in 30 minutes: Send a `sessions_send` message ("please continue").
    - If an agent marks a task as "Ready for Audit": Spawn/Notify the Auditor.
    - If the Auditor provides feedback: Notify the Developer to enter "Fixing" mode.
- **Duration:** The watchdog will be configured to self-terminate after 5 hours (10 cycles).

## 3. The Audit Loop
1. **Implementation:** Developer finishes -> Marks `state.json`.
2. **Verification:** Auditor spawns -> `web_fetch`/Screenshots -> Analysis.
3. **Feedback Loop:** 
    - If Fail: Detailed feedback sent to Developer. Status set to "Fixing".
    - If Pass: Status set to "Verified".
4. **Finalization:** Once all tasks are "Verified", I (Orchestrator) will perform a final workspace check and commit to main.

## 4. Safety & Environment
- **Local Testing:** All agents will work on the files in the workspace. We will use `vite` (already present) to preview changes during the audit phase.
- **No Direct Push:** Agents are restricted from pushing until the full 5-hour window or all "Verified" statuses are achieved.

---
**Status:** Ready to receive task list.
