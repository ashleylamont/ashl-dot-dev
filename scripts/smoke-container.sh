#!/usr/bin/env bash
set -euo pipefail

image=${1:?Pass the locally built Docker image}
container=$(docker run --detach --network none \
  -e TARGET_URL=https://example.invalid \
  -e STEAM_API_KEY=fixture -e STEAM_ID=fixture \
  -e SPOTIFY_USER_ID=fixture -e SPOTIFY_CLIENT_ID=fixture \
  -e SPOTIFY_CLIENT_SECRET=fixture -e SPOTIFY_REFRESH_TOKEN=fixture \
  "$image")
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT

for attempt in {1..20}; do
  if docker exec "$container" bun -e '
    const url = "http://127.0.0.1:4321";
    const options = { redirect: "manual", signal: AbortSignal.timeout(2000) };
    const page = await fetch(url + "/experience", options);
    if (page.status !== 200 || !(await page.text()).includes("<h1>Experience</h1>")) {
      throw new Error("Experience page did not render its heading");
    }
    const route = await fetch(url + "/best-viewed-with", options);
    if (route.status !== 400 || (await route.text()) !== "Incompatible User-Agent") {
      throw new Error("Server-handled route did not produce its expected response");
    }
  ' >/dev/null 2>&1; then
    printf 'Verified the Experience page and a server-handled route in the built image.\n'
    exit 0
  fi
  if [[ $(docker inspect --format '{{.State.Running}}' "$container") != true ]]; then
    break
  fi
  sleep 2
done

docker logs --tail 30 "$container" >&2 || true
printf 'The built image failed its local HTTP smoke test.\n' >&2
exit 1
