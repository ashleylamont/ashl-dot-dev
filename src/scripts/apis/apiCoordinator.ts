import querystring from "node:querystring";
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} from "astro:env/server";

export default class ApiCoordinator {
  private spotifyTokenPromise: Promise<string> | undefined;

  private async fetchSpotifyToken(): Promise<string> {
    const tokenResponse = await fetch(
      `https://accounts.spotify.com/api/token?${querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      })}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
          Accept: "application/json",
        },
      },
    ).catch((e) => {
      throw new Error(`Error fetching Spotify token: ${e}`);
    });
    const tokenResponseBody = await tokenResponse.text();
    try {
      const tokenData = JSON.parse(tokenResponseBody);
      return tokenData.access_token;
    } catch (e) {
      console.warn(
        `Invalid spotify token response (${tokenResponse.status}):`,
        tokenResponseBody,
      );
      throw new Error(`Error parsing Spotify token response: ${e}`);
    }
  }

  public getSpotifyToken(): Promise<string> {
    if (this.spotifyTokenPromise) {
      return this.spotifyTokenPromise;
    }
    this.spotifyTokenPromise = this.fetchSpotifyToken();
    return this.spotifyTokenPromise;
  }
}
