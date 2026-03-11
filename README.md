# humantext.pro MCP Server

AI text detection and humanization tools for Claude Code, Cursor, Windsurf, and any MCP-compatible client.

Check if text sounds AI-generated and transform it to read naturally — without leaving your editor.

## Quick Start

### 1. Get your API key

Sign up at [humantext.pro](https://humantext.pro) and generate an API key on your [API page](https://humantext.pro/api).

### 2. Add to your MCP client

**Claude Code / VS Code:**

Add to `.claude/mcp.json` in your project (or global settings):

```json
{
  "mcpServers": {
    "humantext": {
      "command": "npx",
      "args": ["-y", "@humantext/mcp-server"],
      "env": {
        "HUMANTEXT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Cursor:**

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "humantext": {
      "command": "npx",
      "args": ["-y", "@humantext/mcp-server"],
      "env": {
        "HUMANTEXT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Claude Desktop:**

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "humantext": {
      "command": "npx",
      "args": ["-y", "@humantext/mcp-server"],
      "env": {
        "HUMANTEXT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 3. Use it

Ask your AI assistant:

- *"Check if this text sounds AI-generated"*
- *"Humanize this paragraph to sound more natural"*
- *"Humanize this text and verify the result passes AI detection"*
- *"What's my humantext.pro credit balance?"*

## Tools

### `detect_ai`

Analyze text for AI-generated content. Returns a score (0-100%) and verdict.

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `text`    | string | Yes      | Text to analyze (min 50 characters) |

**Example output:**
```
AI Detection Result
━━━━━━━━━━━━━━━━━━━
Score: 87% AI
Verdict: AI Generated
Words analyzed: 156
Credits remaining: 4,844
```

### `humanize_text`

Transform AI-generated text to sound natural and human-written.

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `text`    | string | Yes      | Text to humanize (min 50 characters) |
| `tone`    | enum   | No       | `casual`, `standard`, `academic`, `professional`, `marketing` |
| `style`   | enum   | No       | `general`, `essay`, `article`, `marketing`, `creative`, `formal`, `report`, `business`, `legal` |
| `level`   | enum   | No       | `light`, `balanced`, `aggressive` (default: aggressive) |

### `humanize_and_detect`

Two-step process: humanize text, then verify the result with AI detection. Proves the output passes detection.

Same parameters as `humanize_text`.

**Example output:**
```
Humanized & Verified
━━━━━━━━━━━━━━━━━━━━

[humanized text here]

━━━━━━━━━━━━━━━━━━━━
Verification: 12% AI → Mostly Human
Words: 156 | Credits remaining: 4,532
```

### `check_balance`

Check your account balance and plan details. No parameters required.

## Pricing

The MCP server uses your [humantext.pro](https://humantext.pro/pricing) subscription credits:

| Plan   | Price      | Monthly Credits |
|--------|-----------|-----------------|
| Basic  | $7.99/mo  | 5,000 words     |
| Pro    | $19.99/mo | 15,000 words    |
| Ultra  | $39.99/mo | 30,000 words    |

Both detection and humanization consume credits based on input word count.

## Environment Variables

| Variable             | Required | Description |
|---------------------|----------|-------------|
| `HUMANTEXT_API_KEY` | Yes      | API key from humantext.pro/api |
| `HUMANTEXT_BASE_URL`| No       | Custom API URL (default: https://humantext.pro/api/v1) |

## Links

- [humantext.pro](https://humantext.pro) — AI Detector & Text Humanizer
- [API Documentation](https://humantext.pro/api/docs) — Interactive Swagger UI
- [Get API Key](https://humantext.pro/api) — Sign up and generate your key
- [Pricing](https://humantext.pro/pricing) — Plans and credits

## License

MIT
