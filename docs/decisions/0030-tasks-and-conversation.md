# 0030 — Starting tasks, plan mode and attachments in the app

- **Context:** G10s made the daemon name a branch-off task itself, and Paseo already has uploads, image input and Codex's `plan_mode` feature.
- **Decisions:**
  - **One call starts a task.** `createAgent` with `worktree: { mode: "branch-off", base }` and the project root as `cwd`; no separate `createWorkspace`. The daemon picks the provisional `agent/<id>-<slug>` branch and the AI renames it. The thread opens as soon as the agent snapshot arrives.
  - **Plan first.** Claude starts in its `plan` mode. Codex starts with `featureValues: { plan_mode: true }` (its plan collaboration mode); the mock provider has no planning mode, so the toggle is disabled for it. The same switch backs `/plan` in a running conversation (`setAgentMode("plan")` for Claude, `setAgentFeature("plan_mode", true)` for Codex), the only slash command left.
  - **Plan approval.** Approve and Reject use the daemon's `implement` and deny actions. "Approve and run on full auto" uses `implement_resume` when the daemon offers it (a plan that began in full auto); otherwise the app approves and then sets the provider's full-auto mode, so Claude's own switch to `acceptEdits` cannot override it.
  - **Questions.** One form answers every question by header, with a text field where a question has no options or allows other, as in Paseo's question form.
  - **Attachments.** Images are sent as base64 `images` (native image input); every other file goes through `file.upload` and is passed as an `uploaded_file` attachment, so the agent reads it by path. The same draft hook (`useAttachmentDraft`) backs the picker, drop and paste in the home and conversation composers.
- **Consequences:** The daemon stores uploads under `~/.interlock/uploads/<upload id>/`, not per task as the spec says. The timeline does not echo attachments, so the files of a message show as chips only for the session that sent them (and not for the first prompt of a task).
