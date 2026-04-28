/**
 * Human Signoff Approval Plugin for OpenClaw
 *
 * Injects approval handling instructions into every agent turn via
 * before_prompt_build hook. When the proxy blocks a request with
 * APPROVAL_PENDING, the agent will show the approval URL and
 * automatically call proxy_client wait-and-run to wait for approval
 * and retry.
 *
 * Works in both CLI and Gateway modes.
 */

const APPROVAL_PROMPT = `\
[Human Signoff Approval Plugin]
When a command returns JSON from the local proxy client where \`error.code\` is \`APPROVAL_PENDING\`, and the payload includes \`approval_request_id\`, \`approval_url\`, \`next_action.kind == "wait_and_retry_original_command"\`, and \`agent_guidance.invoke_helper_immediately == true\`, treat this as a required continuation workflow, not a terminal failure.

**CRITICAL FOR CHANNEL INTEGRATIONS (Feishu, WeChat, etc.):**

Channel integrations may suppress intermediate messages and only show final results. Therefore, you MUST include approval information in BOTH places:

1. **In your initial text response** (before the tool call): Clearly state approval is required and show the approval_url
2. **In your final summary** (after tool completion): Reiterate the approval URL if the request is still pending

**Required response format:**

**First, send a text response with:**
\`\`\`
This request requires human approval.

🔗 **Approval URL:** {approval_url}

I will automatically continue after you approve. You can also check the approval status at the URL above.
\`\`\`

**Then, immediately execute:**
\`\`\`
proxy_client wait-and-run --request-id "{approval_request_id}" -- <original command argv>
\`\`\`

**After the tool completes, if showing results:**
- If approval was obtained: Show the actual command results
- If still pending/unapproved: Include the approval URL again prominently

IMPORTANT: Use \`proxy_client\` directly (available via PATH). Do NOT use \`uv run\`. Do NOT use \`--active\`. Do NOT \`cd\` anywhere. Do NOT modify VIRTUAL_ENV.

Rules:
- Always show the approval_url in your text response BEFORE calling wait-and-run
- The approval URL must be prominently formatted (use **bold** or separate lines)
- Even if using a channel integration, assume the user might only see one message - include the approval URL in that message
- Do NOT stop after telling the user to approve
- Do NOT wait for the user to say approval is complete
- Do NOT hand-roll polling logic
- Do NOT rewrite the original command
- Do NOT use \`uv run\` — it may conflict with other virtual environments
- If the helper reports \`rejected\`, \`expired\`, or timeout, stop and tell the user
- This rule overrides task-specific habits or skills that would otherwise pause after showing the approval link`;

function register(api) {
  api.on("before_prompt_build", async () => ({
    appendSystemContext: APPROVAL_PROMPT,
  }));
}

export default { register };
