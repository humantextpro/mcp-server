#!/usr/bin/env node

/**
 * humantext.pro MCP Server
 *
 * Provides AI text detection and humanization tools via the Model Context Protocol.
 * Works with Claude Code, Cursor, Windsurf, and any MCP-compatible client.
 *
 * Usage:
 *   npx @humantext/mcp-server
 *
 * Configuration:
 *   HUMANTEXT_API_KEY - Your API key from humantext.pro/api
 *   HUMANTEXT_BASE_URL - Optional custom API base URL
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  HumantextApiClient,
  HumantextApiError,
  type Tone,
  type Style,
  type Level,
} from "./api-client.js";

// --- Configuration ---

const API_KEY = process.env.HUMANTEXT_API_KEY;
const BASE_URL = process.env.HUMANTEXT_BASE_URL;

if (!API_KEY) {
  console.error(
    "Error: HUMANTEXT_API_KEY environment variable is required.\n" +
    "Get your API key at: https://humantext.pro/api\n\n" +
    "Add to your MCP config:\n" +
    '  "env": { "HUMANTEXT_API_KEY": "your_key_here" }'
  );
  process.exit(1);
}

const client = new HumantextApiClient(API_KEY, BASE_URL);

// --- Helper ---

function formatError(error: unknown): string {
  if (error instanceof HumantextApiError) {
    switch (error.code) {
      case "INSUFFICIENT_BALANCE":
        return [
          `Insufficient credits. Balance: ${error.balance} words, required: ${error.required} words.`,
          ``,
          `Buy more credits: https://humantext.pro/pricing`,
          `Buy a word pack: https://humantext.pro/buy-words`,
        ].join("\n");

      case "INVALID_API_KEY":
        return [
          `Invalid or missing API key.`,
          ``,
          `Get your API key: https://humantext.pro/api`,
          `Setup guide: https://www.npmjs.com/package/@humantext/mcp-server`,
        ].join("\n");

      case "SUBSCRIPTION_REQUIRED":
        return [
          `Active subscription required to use the API.`,
          ``,
          `Subscribe: https://humantext.pro/pricing`,
        ].join("\n");

      case "SUBSCRIPTION_CANCELLED":
        return [
          `Your subscription has been cancelled.`,
          ``,
          `Resubscribe: https://humantext.pro/pricing`,
          `Manage subscription: https://humantext.pro/manage-subscription`,
        ].join("\n");

      case "SUBSCRIPTION_PAUSED":
        return [
          `Your subscription is currently paused.`,
          ``,
          `Resume subscription: https://humantext.pro/manage-subscription`,
        ].join("\n");

      case "RATE_LIMITED":
        return "Rate limit exceeded. Please wait a moment and try again.";

      case "GATEWAY_TIMEOUT":
      case "BAD_GATEWAY":
        return "Service temporarily unavailable. Please try again in a moment.";

      default:
        return error.message;
    }
  }
  return error instanceof Error ? error.message : "Unknown error occurred";
}

function scoreVerdict(score: number): string {
  if (score < 0.15) return "Human Written";
  if (score < 0.50) return "Mostly Human";
  if (score < 0.75) return "Likely AI";
  return "AI Generated";
}

// --- MCP Server ---

const server = new McpServer({
  name: "humantext",
  version: "1.0.0",
});

// Tool: detect_ai
server.tool(
  "detect_ai",
  "Check if text is AI-generated. Returns an AI probability score (0-100%) and verdict. Useful for checking content before publishing.",
  {
    text: z
      .string()
      .min(50, "Text must be at least 50 characters")
      .describe("The text to analyze for AI-generated content"),
  },
  async ({ text }) => {
    try {
      const result = await client.detect(text);
      const percentage = Math.round(result.score * 100);
      const verdict = scoreVerdict(result.score);

      return {
        content: [
          {
            type: "text" as const,
            text: [
              `AI Detection Result`,
              `━━━━━━━━━━━━━━━━━━━`,
              `Score: ${percentage}% AI`,
              `Verdict: ${verdict}`,
              `Words analyzed: ${result.word_count}`,
              `Credits remaining: ${result.credits_remaining}`,
            ].join("\n"),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: formatError(error) }],
        isError: true,
      };
    }
  }
);

// Tool: humanize_text
server.tool(
  "humanize_text",
  "Transform AI-generated text to sound natural and human-written. Preserves meaning while improving readability. Use this after writing content with AI to make it sound authentic.",
  {
    text: z
      .string()
      .min(50, "Text must be at least 50 characters")
      .describe("The AI-generated text to humanize"),
    tone: z
      .enum(["casual", "standard", "academic", "professional", "marketing"])
      .optional()
      .describe("Writing tone (default: standard)"),
    style: z
      .enum([
        "general", "essay", "article", "marketing",
        "creative", "formal", "report", "business", "legal",
      ])
      .optional()
      .describe("Content style (default: general)"),
    level: z
      .enum(["light", "balanced", "aggressive"])
      .optional()
      .describe("Humanization intensity — light preserves more original wording, aggressive makes maximum changes (default: aggressive)"),
  },
  async ({ text, tone, style, level }) => {
    try {
      const result = await client.humanize(text, {
        tone: tone as Tone | undefined,
        style: style as Style | undefined,
        level: level as Level | undefined,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: [
              `Humanized Text`,
              `━━━━━━━━━━━━━━`,
              ``,
              result.output,
              ``,
              `━━━━━━━━━━━━━━`,
              `Words: ${result.word_count} | Credits remaining: ${result.credits_remaining}`,
            ].join("\n"),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: formatError(error) }],
        isError: true,
      };
    }
  }
);

// Tool: humanize_and_detect
server.tool(
  "humanize_and_detect",
  "Humanize text AND verify the result with AI detection. Two-step process: first humanizes the text, then checks the humanized version to prove it passes AI detection. Best for when you need guaranteed results.",
  {
    text: z
      .string()
      .min(50, "Text must be at least 50 characters")
      .describe("The AI-generated text to humanize and verify"),
    tone: z
      .enum(["casual", "standard", "academic", "professional", "marketing"])
      .optional()
      .describe("Writing tone (default: standard)"),
    style: z
      .enum([
        "general", "essay", "article", "marketing",
        "creative", "formal", "report", "business", "legal",
      ])
      .optional()
      .describe("Content style (default: general)"),
    level: z
      .enum(["light", "balanced", "aggressive"])
      .optional()
      .describe("Humanization intensity (default: aggressive)"),
  },
  async ({ text, tone, style, level }) => {
    try {
      // Step 1: Humanize
      const humanized = await client.humanize(text, {
        tone: tone as Tone | undefined,
        style: style as Style | undefined,
        level: level as Level | undefined,
      });

      // Step 2: Detect the humanized result
      const detection = await client.detect(humanized.output);
      const percentage = Math.round(detection.score * 100);
      const verdict = scoreVerdict(detection.score);

      return {
        content: [
          {
            type: "text" as const,
            text: [
              `Humanized & Verified`,
              `━━━━━━━━━━━━━━━━━━━━`,
              ``,
              humanized.output,
              ``,
              `━━━━━━━━━━━━━━━━━━━━`,
              `Verification: ${percentage}% AI → ${verdict}`,
              `Words: ${humanized.word_count} | Credits remaining: ${detection.credits_remaining}`,
            ].join("\n"),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: formatError(error) }],
        isError: true,
      };
    }
  }
);

// Tool: check_balance
server.tool(
  "check_balance",
  "Check your humantext.pro account balance, plan, and remaining credits.",
  {},
  async () => {
    try {
      const result = await client.account();

      return {
        content: [
          {
            type: "text" as const,
            text: [
              `Account: ${result.email}`,
              `Plan: ${result.plan}${result.subscription_status ? ` (${result.subscription_status})` : ""}`,
              `Credits: ${result.credits.total.toLocaleString()} words`,
              `  Subscription: ${result.credits.subscription.toLocaleString()}`,
              `  Package: ${result.credits.package.toLocaleString()}`,
              `Max words/request: ${result.limits.words_per_request.toLocaleString()}`,
            ].join("\n"),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: formatError(error) }],
        isError: true,
      };
    }
  }
);

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
