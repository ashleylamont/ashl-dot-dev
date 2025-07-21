import type ApiCoordinator from "./apiCoordinator.ts";

export abstract class Api<T, R = T[]> {
  protected abstract getRequestUrl(maxItemCount: number): string;
  protected abstract getRequestHeaders(token: string | null): HeadersInit;
  protected requestMethod: "GET" | "POST" = "GET";
  protected needsToken: "spotify" | "none" = "none";

  protected abstract parseResponse(responseData: R): T[];

  protected abstract fallbackItem(): T;

  public constructor(protected readonly apiCoordinator: ApiCoordinator) {}

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

      return this.parseResponse((await requestResponse.json()) as R).slice(
        0,
        maxItemCount,
      );
    } catch (error) {
      console.error(error);
      return [this.fallbackItem()];
    }
  }
}
