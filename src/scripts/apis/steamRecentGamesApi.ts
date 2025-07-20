import { Api } from "./api.ts";
import type { ISteamGame, ISteamResponse } from "./steam";
import { STEAM_API_KEY, STEAM_ID } from "astro:env/server";
import querystring from "node:querystring";

export class SteamRecentGamesApi extends Api<ISteamGame, ISteamResponse> {
  protected override getRequestUrl(maxItemCount: number): string {
    const urlQueryData = {
      key: STEAM_API_KEY,
      steamid: STEAM_ID,
      count: maxItemCount,
    };
    return `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?${querystring.stringify(urlQueryData)}`;
  }

  protected override getRequestHeaders(): HeadersInit {
    return {};
  }

  protected override parseResponse(responseData: ISteamResponse): ISteamGame[] {
    return responseData.response.games;
  }

  protected override fallbackItem(): ISteamGame {
    return {
      appid: 0,
      name: "failed to fetch recent games",
      playtime_2weeks: 0,
      playtime_forever: 0,
      img_icon_url: "",
      img_logo_url: "",
    };
  }
}
