# OpenClaw Human Signoff Approval Plugin

Auto-handles `APPROVAL_PENDING` responses from Human Signoff for OpenClaw.

## How it works

This plugin registers a `before_prompt_build` hook that injects approval handling instructions into every agent turn. When a command is blocked and requires approval, the agent will:

1. Show the approval URL to the user
2. Automatically call `signoff wait` to wait for approval completion
3. Retry the original command after approval is granted

This works across **all channels** (CLI, TUI, Gateway integrations, etc.) because the before_prompt_build hook is active in all modes.

## Prerequisites

1. **Human Signoff MVP** is deployed and running

## Installation

### Step 1: Install the signoff client

Install the `signoff` CLI from [merico-ai/human-signoff-releases](https://github.com/merico-ai/human-signoff-releases):

```bash
# Download and run the installer
curl -fsSL -o install.sh https://raw.githubusercontent.com/merico-ai/human-signoff-releases/main/install.sh
bash install.sh
```

The installer downloads the `signoff` CLI binary and can optionally configure the Hermes approval plugin, the OpenClaw approval plugin, and the CA certificate / gateway proxy settings.

```bash
# Verify installation
which signoff
signoff --help

# Login
signoff login
```

### Step 2: Install and enable the plugin

```bash
# Clone to any location
cd /tmp
git clone https://github.com/merico-ai/openclaw-human-signoff.git

# Install from local directory
openclaw plugins install ./openclaw-human-signoff

# Enable the plugin
openclaw plugins enable human-signoff-approval
```

### Step 3: Configure Gateway proxy (macOS only)

> **Note:** These instructions are for macOS only. On Linux, Gateway runs as a systemd service and requires different configuration.

Edit `~/Library/LaunchAgents/ai.openclaw.gateway.plist` and add proxy environment variables:

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

### Step 4: Restart Gateway (macOS only)

> **Note:** These instructions are for macOS only. On Linux, use `systemctl --user restart openclaw-gateway`.

```bash
launchctl bootout gui/$(id -u)/ai.openclaw.gateway
sleep 2
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

### Verify installation

```bash
# Check plugin status
openclaw plugins list | grep human-signoff
```

## Usage

### TUI mode

```bash
openclaw tui
# Send a command that requires approval
```

> **Note:** OpenClaw TUI mode goes through Gateway, so Gateway proxy configuration applies automatically.

### Gateway mode

Through any configured integration (Feishu, WeChat, etc.), send a command that requires approval. The agent will show the approval URL and automatically continue after you approve.

## Uninstallation

```bash
# Disable and remove
openclaw plugins disable human-signoff-approval
openclaw plugins uninstall human-signoff-approval
openclaw gateway restart
```

## Troubleshooting

### Plugin not working

1. Check plugin is enabled: `openclaw plugins list`
2. Check Gateway is running: `openclaw gateway status`
3. Verify signoff is in PATH: `which signoff`

### Approval URL not showing in channels

1. Check Gateway logs for any errors
2. Restart Gateway
3. Verify plugin is loaded: check Gateway startup logs for "human-signoff-approval"

### `signoff wait` fails

1. Ensure signoff is logged in: `signoff login`
2. Check signoff can reach backend
3. Verify the approval request ID is correct
4. Ensure the agent is using `signoff` directly, not `uv run signoff`

### Agent tries to use `uv run` instead of `signoff`

1. Ensure you have the latest version of the plugin installed
2. Restart Gateway after plugin update
3. Check that the plugin instructions describe user-defined approval rules, not implementation details

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please use the GitHub issue tracker.
