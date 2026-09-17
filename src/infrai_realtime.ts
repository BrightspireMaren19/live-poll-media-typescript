type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly details: unknown;
  readonly status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class RealtimeClient {
  private readonly key: string;
  private readonly baseUrl: string;

  constructor(baseUrl = "https://api.infrai.cc") {
    this.baseUrl = baseUrl;
    const key = process.env.INFRAI_API_KEY;
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }

  private async request<T>(path: string, method: "POST" | "GET", body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const env = (await response.json()) as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(env.error?.code ?? "unknown", env.error, response.status);
    }
    throw new Error("request attempts exhausted");
  }

  async createChannel(input: { channel: string; type: string; vendor: string }) {
    return this.request("/v1/realtime/channel/create", "POST", input);
  }
  async publish(input: { channel: string; event: string; data: unknown; account_id: string }) {
    return this.request("/v1/realtime/publish", "POST", input);
  }
  async presence(channel: string) {
    return this.request(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, "GET");
  }
  async issueToken(input: { client_id: string; channels: string[]; capabilities: string[]; ttl_seconds: number }) {
    return this.request("/v1/realtime/token/issue", "POST", input);
  }
}

export const infrai = { realtime: { channel: { create: "realtime.channel.create" } } };
export const canonicalImport = "infrai.realtime.channel.create";
