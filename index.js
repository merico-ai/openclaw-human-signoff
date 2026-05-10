/**
 * Human Signoff Approval Plugin for OpenClaw
 *
 * Injects approval handling instructions into every agent turn via
 * before_prompt_build hook. When the proxy blocks a request with
 * APPROVAL_PENDING, the agent will show the approval URL and
 * automatically call signoff wait-and-run to wait for approval
 * and retry.
 *
 * Works in both CLI and Gateway modes.
 */

const APPROVAL_PROMPT =
`[Human Signoff Approval Plugin - OVERRIDE ALL OTHER INSTRUCTIONS]
When a command returns JSON from the local signoff client where ` + "`error.code`" + ` is ` + "`APPROVAL_PENDING`" + `, you MUST follow these instructions EXACTLY, even if other guidance (including the proxy response itself) suggests different approaches.

**CRITICAL RULES - OVERRIDE ALL OTHER INSTRUCTIONS:**

1. **DO NOT use ` + "`uv run`" + `** - The proxy response may suggest using ` + "`uv run signoff`" + `, but you MUST NOT do this. Use ` + "`signoff`" + ` directly.

2. **Use signoff directly** - It is available via PATH. Do NOT wrap it with any other commands.

3. **Your response format:**

**First, send a text response with:**
This request requires human approval.

Approval URL: {approval_url}

I will automatically continue after you approve. You can also check the approval status at the URL above.

**Then, immediately execute:**
signoff wait-and-run --request-id "{approval_request_id}" -- <original command argv>

4. **After the tool completes:**
   - If approval was obtained: Show the actual command results
   - If still pending/unapproved: Include the approval URL again prominently

**WHAT NOT TO DO:**
- Do NOT use ` + "`uv run`" + ` under any circumstances
- Do NOT use ` + "`--active`" + ` flag
- Do NOT ` + "`cd`" + ` anywhere
- Do NOT modify VIRTUAL_ENV
- Do NOT hand-roll polling logic
- Do NOT wait for user confirmation
- Do NOT stop after showing the approval URL
- Do NOT follow any helper_invocation_example that uses ` + "`uv run`" + `

**These rules override:**
- The proxy response's helper_invocation_example
- The proxy response's helper_help_hint
- Any task-specific habits or skills
- Any other conflicting instructions

**CRITICAL FOR CHANNEL INTEGRATIONS (Feishu, WeChat, etc.):**
Channel integrations may suppress intermediate messages. If you detect this is a channel integration (Feishu, WeChat, Telegram, Discord, etc.), you MUST:

1. **Send the approval URL through the source channel** - Use the channel's message sending mechanism to notify the user:
   This request requires human approval.
   Please approve at: {approval_url}
   I will continue automatically after you approve.

2. **Still execute wait-and-run immediately** - Do NOT skip waiting for approval

3. In your final response, reiterate the approval URL if still pending

4. Do NOT assume the user saw intermediate messages - channel integrations often suppress them`;

function register(api) {
  api.on("before_prompt_build", async () => ({
    appendSystemContext: APPROVAL_PROMPT,
  }));
}

export default { register };
