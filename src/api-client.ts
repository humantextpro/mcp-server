/**
 * HTTP client for humantext.pro API v1
 */

const DEFAULT_BASE_URL = "https://humantext.pro/api/v1";

export interface DetectResult {
  success: boolean;
  score: number;
  word_count: number;
  credits_remaining: number;
}

export interface HumanizeResult {
  success: boolean;
  output: string;
  word_count: number;
  credits_remaining: number;
}

export interface AccountResult {
  success: boolean;
  email: string;
  name: string | null;
  plan: string;
  subscription_status: string | null;
  credits: {
    subscription: number;
    package: number;
    total: number;
  };
  limits: {
    words_per_request: number;
  };
}

export interface ApiError {
  error: string;
  code?: string;
  balance?: number;
  required?: number;
}

export type Tone = "casual" | "standard" | "academic" | "professional" | "marketing";
export type Style = "general" | "essay" | "article" | "marketing" | "creative" | "formal" | "report" | "business" | "legal";
export type Level = "light" | "balanced" | "aggressive";

export class HumantextApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || DEFAULT_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "x-source": "mcp-server",
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new HumantextApiError(
        error.error || `API error ${response.status}`,
        response.status,
        error.code,
        error.balance,
        error.required
      );
    }

    return data as T;
  }

  async detect(content: string): Promise<DetectResult> {
    return this.request<DetectResult>("/detect", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async humanize(
    content: string,
    options?: { tone?: Tone; style?: Style; level?: Level }
  ): Promise<HumanizeResult> {
    return this.request<HumanizeResult>("/humanize", {
      method: "POST",
      body: JSON.stringify({
        content,
        ...options,
      }),
    });
  }

  async account(): Promise<AccountResult> {
    return this.request<AccountResult>("/account");
  }
}

export class HumantextApiError extends Error {
  status: number;
  code?: string;
  balance?: number;
  required?: number;

  constructor(
    message: string,
    status: number,
    code?: string,
    balance?: number,
    required?: number
  ) {
    super(message);
    this.name = "HumantextApiError";
    this.status = status;
    this.code = code;
    this.balance = balance;
    this.required = required;
  }
}
