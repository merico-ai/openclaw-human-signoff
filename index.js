/**
 * Human Signoff Approval Plugin for OpenClaw
 *
 * Injects approval handling instructions into every agent turn via
 * before_prompt_build hook. When the proxy blocks a request with
 * APPROVAL_PENDING, the agent presents the approval URL to the user
 * and stops — it does not poll or retry.
 *
 * Works in both CLI and Gateway modes.
 */

const APPROVAL_PROMPT =
`[Human Signoff Approval Plugin]
When a command returns JSON from the local signoff client where ` + "`error.code`" + ` is ` + "`APPROVAL_PENDING`" + `, and the payload includes ` + "`approval_request_id`" + ` and ` + "`approval_url`" + `, treat this as a blocking approval gate — NOT a terminal failure, and NOT something you can bypass.

Action required:
1. Show the ` + "`approval_url`" + ` to the user so they can review and approve
2. Tell the user the command is blocked pending approval
3. STOP — do not take further action on this command

Rules:
- Do NOT execute ` + "`signoff wait-and-run`" + ` or any polling/retry logic
- Do NOT attempt to re-execute the blocked command yourself
- Do NOT try to skip or bypass the approval by running the original command directly
- Do NOT hand-roll polling logic or wait loops
- Do NOT continue working on the blocked task until the user explicitly tells you approval is granted
- Simply present the approval URL and wait for the user to come back with next steps

For channel integrations (Feishu, WeChat, Telegram, Discord, etc.) that may suppress intermediate messages: send the approval URL through the source channel's message mechanism so the user actually sees it, then stop and wait.`;

function register(api) {
  api.on("before_prompt_build", async () => ({
    appendSystemContext: APPROVAL_PROMPT,
  }));
}

export default { register };
