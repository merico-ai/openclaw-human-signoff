# OpenClaw Human Signoff Approval Plugin

Auto-handles `APPROVAL_PENDING` responses from the human-signoff proxy for OpenClaw.

## How it works

This plugin registers a `before_prompt_build` hook that injects approval handling instructions into every agent turn. When a command is blocked and requires approval, the agent will:

1. Show the approval URL to the user
2. Automatically call `proxy_client wait-and-run` to wait for approval and retry

This works across **all channels** (CLI, TUI, Gateway integrations, etc.) because the before_prompt_build hook is active in all modes.

## Prerequisites

1. **Human Signoff MVP** is deployed and running
2. **proxy_client** is available in PATH:
   ```bash
   which proxy_client
   proxy_client --help
   ```
3. **proxy_client is logged in**:
   ```bash
   proxy_client login
   ```

## Installation

### Install from GitHub (recommended)

```bash
openclaw plugins install merico-ai/openclaw-human-signoff

# Enable the plugin
openclaw plugins enable human-signoff-approval

# Restart Gateway
openclaw gateway restart
```

### Manual installation

```bash
# Clone the repository
git clone git@github.com:merico-ai/openclaw-human-signoff.git ~/.openclaw/plugins/human-signoff-approval

# Enable the plugin
openclaw plugins enable human-signoff-approval

# Restart Gateway
openclaw gateway restart
```

## Configuration

### Required: Disable streaming mode for channels

When using Gateway mode with channels (Feishu, WeChat, etc.), ensure streaming is properly configured in OpenClaw config.

### Gateway proxy setup

If using OpenClaw Gateway with integrations, configure proxy environment in `~/Library/LaunchAgents/ai.openclaw.gateway.plist`:

```xml
<key>EnvironmentVariables</key>
<dict>
    <key>HTTP_PROXY</key>
    <string>http://127.0.0.1:17771</string>
    <key>HTTPS_PROXY</key>
    <string>http://127.0.0.1:17771</string>
    <key>NO_PROXY</key>
    <string>localhost,127.0.0.1</string>
</dict>
```

Reload with:
```bash
launchctl bootout gui/$(id -u)/ai.openclaw.gateway
sleep 2
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

## Usage

### CLI mode

```bash
openclaw tui
# Send a command that requires approval
```

### Gateway mode

Through any configured integration, send a command that requires approval. The agent will show the approval URL and automatically continue after you approve.

## Verification

```bash
# Check plugin status
openclaw plugins list

# Check plugin details
openclaw plugins inspect human-signoff-approval
```

## Uninstallation

```bash
# Disable and remove
openclaw plugins disable human-signoff-approval
openclaw plugins uninstall human-signoff-approval
```

## Troubleshooting

### Plugin not working

1. Check plugin is enabled: `openclaw plugins list`
2. Check Gateway is running: `openclaw gateway status`
3. Verify proxy_client is in PATH: `which proxy_client`

### Approval URL not showing in channels

1. Check OpenClaw streaming configuration
2. Restart Gateway
3. Check Gateway logs

### `wait-and-run` fails

1. Ensure proxy_client is logged in: `proxy_client login`
2. Check proxy_client can reach backend

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please use the GitHub issue tracker.
