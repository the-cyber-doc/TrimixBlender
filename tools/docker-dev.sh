#!/usr/bin/env bash
# Build the production image from this checkout and run it locally (docker-compose.yaml):
# http://127.0.0.1:8080/ (BLENDER_PORT to change it).
#
#   tools/docker-dev.sh              build, then run in the foreground (Ctrl+C stops)
#   tools/docker-dev.sh up -d --build   any other "docker compose" arguments
#   tools/docker-dev.sh logs -f
#   tools/docker-dev.sh down         stop and remove the container
#
# Run it as yourself: it uses "sudo docker" by itself if your user cannot reach Docker.
# Building needs `docker login dhi.io` once, as the same user (a free Docker account).
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
sudo=()
docker info >/dev/null 2>&1 || sudo=(sudo)

# Shown on the About page (no .git in the image's build context): version and commit.
commit=$(git -C "$root" rev-parse --short HEAD 2>/dev/null || true) # none: the build time (vite.config.ts)
version=""
if [[ -z $(git -C "$root" status --porcelain 2>/dev/null) ]]; then
	# A clean checkout of a tag: that release's version; else "dev" (vite.config.ts).
	version=$(git -C "$root" describe --tags --exact-match 2>/dev/null || true)
elif [[ -n $commit ]]; then
	commit+=-dirty
fi

(($#)) || set -- up --build
exec "${sudo[@]}" env APP_VERSION="$version" APP_COMMIT="$commit" BLENDER_PORT="${BLENDER_PORT:-8080}" \
	docker compose -f "$root/docker-compose.yaml" "$@"
