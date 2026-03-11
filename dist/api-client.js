/**
 * HTTP client for humantext.pro API v1
 */
const DEFAULT_BASE_URL = "https://humantext.pro/api/v1";
export class HumantextApiClient {
    apiKey;
    baseUrl;
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl || DEFAULT_BASE_URL;
    }
    async request(endpoint, options = {}) {
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
            const error = data;
            throw new HumantextApiError(error.error || `API error ${response.status}`, response.status, error.code, error.balance, error.required);
        }
        return data;
    }
    async detect(content) {
        return this.request("/detect", {
            method: "POST",
            body: JSON.stringify({ content }),
        });
    }
    async humanize(content, options) {
        return this.request("/humanize", {
            method: "POST",
            body: JSON.stringify({
                content,
                ...options,
            }),
        });
    }
    async account() {
        return this.request("/account");
    }
}
export class HumantextApiError extends Error {
    status;
    code;
    balance;
    required;
    constructor(message, status, code, balance, required) {
        super(message);
        this.name = "HumantextApiError";
        this.status = status;
        this.code = code;
        this.balance = balance;
        this.required = required;
    }
}
//# sourceMappingURL=api-client.js.map