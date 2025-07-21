import { Api } from "./api.ts";

abstract class SpotifyApi extends Api<
  Pick<SpotifyApi.TrackObjectFull, "name" | "external_urls">,
  SpotifyApi.UsersTopTracksResponse
> {
  protected abstract timeScale: "short" | "medium";
  protected override readonly needsToken = "spotify";

  protected override getRequestUrl(maxItemCount: number): string {
    return `https://api.spotify.com/v1/me/top/tracks?time_range=${this.timeScale}_term&limit=${maxItemCount}`;
  }

  protected override getRequestHeaders(token: string | null): HeadersInit {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  protected override parseResponse(
    responseData: SpotifyApi.UsersTopTracksResponse,
  ): Pick<SpotifyApi.TrackObjectFull, "name" | "external_urls">[] {
    return responseData.items.map((song) => ({
      name: song.name,
      external_urls: song.external_urls,
    }));
  }

  protected override fallbackItem(): Pick<
    SpotifyApi.TrackObjectFull,
    "name" | "external_urls"
  > {
    return {
      name: `failed to fetch ${this.timeScale}-term top songs`,
      external_urls: { spotify: "" },
    };
  }
}

export class SpotifyShortTermApi extends SpotifyApi {
  protected readonly timeScale = "short";
}

export class SpotifyMediumTermApi extends SpotifyApi {
  protected readonly timeScale = "medium";
}
