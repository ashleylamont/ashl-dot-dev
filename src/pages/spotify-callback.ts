import type {APIContext} from "astro";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_USER_ID } from "astro:env/server";
import * as querystring from "node:querystring";

export const prerender = false;

export async function GET({cookies, request}: APIContext) {
  const state = cookies.get("spotify_auth_state")?.value;
  const spotifyState = new URL(request.url).searchParams.get('state')

  if (state !== spotifyState) {
    console.log("Invalid state", state, spotifyState)
    return new Response("Invalid state", {status: 400});
  }

  const code = new URL(request.url).searchParams.get('code');
  const {access_token, refresh_token} = await fetch("https://accounts.spotify.com/api/token?"+querystring.stringify({
    code,
    redirect_uri: `${new URL(request.url).origin}/spotify-callback`,
    grant_type: "authorization_code"
  }), {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      "Content-Type": "application/x-www-form-urlencoded",
      'Accept': 'application/json'
    },
  }).then(res=>res.json());
  const userProfile = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  }).then(res=>res.json());
  if (userProfile.id !== SPOTIFY_USER_ID) {
    return new Response("Invalid user. Log in as site owner.", {status: 400});
  }
  return new Response(refresh_token, {
    status: 200,
  });
}
