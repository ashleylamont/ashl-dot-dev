import {randomBytes} from "node:crypto";
import type {APIContext} from "astro";
import * as querystring from "node:querystring";
import { SPOTIFY_CLIENT_ID } from "astro:env/server";

export const prerender = false;

export async function GET({request}: APIContext) {
  const state = randomBytes(16).toString("hex");
  const scope = "user-top-read user-read-private user-read-email";

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: "code",
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: `${new URL(request.url).origin}/spotify-callback`,
        state: state
      })}`,
      'Set-Cookie': `spotify_auth_state=${state}; Path=/; Secure; HttpOnly; SameSite=Strict`
    }
  })
}
