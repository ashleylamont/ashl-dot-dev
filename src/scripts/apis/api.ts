import type ApiCoordinator from "./apiCoordinator.ts";

export abstract class Api<T, R = T[]> {
  protected abstract getRequestUrl(maxItemCount: number): string;
  protected abstract getRequestHeaders(token: string | null): HeadersInit;
  protected requestMethod: "GET" | "POST" = "GET";
  protected needsToken: "spotify" | "none" = "none";

  protected abstract parseResponse(responseData: R): T[];

  protected abstract fallbackItem(): T;

  public constructor(protected readonly apiCoordinator: ApiCoordinator) {}

  private parseJsonBody(responseBody: string): R {
    try {
      return JSON.parse(responseBody) as R;
    } catch (error) {
      throw new Error(`Invalid JSON response: ${String(error)}`);
    }
  }

  public async get(maxItemCount: number = 3): Promise<T[]> {
    try {
      let token: string | null = null;
      if (this.needsToken === "spotify") {
        token = await this.apiCoordinator.getSpotifyToken();
      }
      const requestUrl = this.getRequestUrl(maxItemCount);
      const requestHeaders = this.getRequestHeaders(token);

      const requestResponse: Response = await fetch(requestUrl, {
        headers: {
          Accept: "application/json",
          ...requestHeaders,
        },
        method: this.requestMethod,
      });

      const responseBody = await requestResponse.text();
      if (!requestResponse.ok) {
        throw new Error(
          `Request failed with ${requestResponse.status}: ${responseBody.slice(0, 300)}`,
        );
      }

      const responseData = this.parseJsonBody(responseBody);

      return this.parseResponse(responseData).slice(0, maxItemCount);
    } catch (error) {
      console.warn(`[API:${this.constructor.name}] ${String(error)}`);
      return [this.fallbackItem()];
    }
  }
}
