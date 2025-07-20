import { Api } from "./api.ts";
import type { ISteamGame, ISteamResponse } from "./steam";
import { STEAM_API_KEY, STEAM_ID } from "astro:env/server";
import querystring from "node:querystring";

export class SteamMostPlayedGamesApi extends Api<ISteamGame, ISteamResponse> {
  protected override getRequestUrl(): string {
    const urlQueryData = {
      key: STEAM_API_KEY,
      steamid: STEAM_ID,
      format: "json",
      include_appinfo: true,
    };
    return `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?${querystring.stringify(urlQueryData)}`;
  }

  protected override getRequestHeaders(): HeadersInit {
    return {};
  }

  protected override parseResponse(responseData: ISteamResponse): ISteamGame[] {
    return responseData.response.games.sort(
      (a, b) => b.playtime_forever - a.playtime_forever,
    );
  }

  protected override fallbackItem(): ISteamGame {
    return {
      appid: 0,
      name: "failed to fetch most played games",
      playtime_2weeks: 0,
      playtime_forever: 0,
      img_icon_url: "",
      img_logo_url: "",
    };
  }
}
