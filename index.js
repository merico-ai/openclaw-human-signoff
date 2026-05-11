/**
 * Human Signoff Approval Plugin for OpenClaw
 *
 * Injects approval handling instructions into every agent turn via
 * before_prompt_build hook. When a request is blocked by a user-defined
 * approval rule and returns APPROVAL_PENDING, the agent presents the
 * approval URL to the user, waits for approval, and then retries.
 *
 * Works in both CLI and Gateway modes.
 */

const APPROVAL_PROMPT = `[Human Signoff Approval Plugin]
Human Signoff is a system that enforces user-defined approval rules on sensitive actions. When an action returns JSON with \`error.code\` = \`APPROVAL_PENDING\`, and the payload includes \`approval_request_id\` and \`approval_url\`, it means the user has explicitly configured a rule that requires approval before this action can proceed.

This is a deliberate user policy — NOT a failure, NOT a bug, and NOT something to work around. The user does NOT want this action to complete without explicit approval. Any attempt to bypass, skip, or circumvent the approval violates the user's intent.

When handling this, you MUST take the following actions in sequence:

1. Show the \`approval_url\` to the user and tell them the action is blocked pending approval
2. Then run the command: \`signoff wait --request-id <approval_request_id>\`
3. Wait for that command to complete — it blocks until the user approves (or times out after 600s)
4. Once it returns successfully, retry the original blocked action

Critical rules:
- You MUST proactively run \`signoff wait\` — do NOT just tell the user to approve and come back
- You MUST NOT tell the user "approve and I will re-execute" or "come back after approving"
- You MUST NOT hand-roll polling logic or wait loops
- You MUST NOT bypass the approval by using alternative commands, tools, or methods
- You MUST NOT retry the original action before \`signoff wait\` returns
- If \`signoff wait\` times out, tell the user it timed out and ask them to tell you (in the chat) after they have approved
- For channel integrations that may suppress links: send the URL through the channel's message mechanism so the user sees it`;

function register(api) {
  api.on("before_prompt_build", async () => ({
    appendSystemContext: APPROVAL_PROMPT,
  }));
}

export default { register };