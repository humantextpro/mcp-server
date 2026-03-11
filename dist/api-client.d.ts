/**
 * HTTP client for humantext.pro API v1
 */
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
export declare class HumantextApiClient {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string, baseUrl?: string);
    private request;
    detect(content: string): Promise<DetectResult>;
    humanize(content: string, options?: {
        tone?: Tone;
        style?: Style;
        level?: Level;
    }): Promise<HumanizeResult>;
    account(): Promise<AccountResult>;
}
export declare class HumantextApiError extends Error {
    status: number;
    code?: string;
    balance?: number;
    required?: number;
    constructor(message: string, status: number, code?: string, balance?: number, required?: number);
}
