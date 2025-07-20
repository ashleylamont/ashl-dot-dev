export interface ISteamResponse {
  response: {
    total_count: number;
    games: ISteamGame[];
  };
}

export interface ISteamGame {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
  has_community_visible_stats?: boolean;
}
