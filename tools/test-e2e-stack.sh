#!/usr/bin/env bash
# All the browser tests (tests/e2e, tests/pwa) against the real container: the production
# image built from this checkout (or a published one), run as in production (read-only,
# no capabilities), as a throwaway compose project removed at the end.
#
#   tools/test-e2e-stack.sh                               image built from this checkout
#   tools/test-e2e-stack.sh --prefix /some/folder         the same image behind an nginx proxy that
#                                                         publishes it under /some/folder/ (as the README)
#   tools/test-e2e-stack.sh --images user/trimix-blender:1.2.3   a published image (pulled)
#   tools/test-e2e-stack.sh -- -g "offline"               any playwright arguments, after --
#
# Run it as yourself, not with sudo (the test files would belong to root): it uses
# "sudo docker" by itself if your user cannot reach Docker. Building needs
# `docker login dhi.io` once. The browsers: Playwright's Chromium (npx playwright install
# chromium). Port: E2E_PORT (default 8090), so a tools/docker-dev.sh on 8080 can keep running.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
image=""
prefix=""
while (($#)); do
	case $1 in
		--images) image=${2:?--images needs an image, e.g. user/trimix-blender:1.2.3}; shift 2 ;;
		--prefix) prefix=${2:?--prefix needs a path, e.g. /blender}; prefix=${prefix%/}; shift 2 ;;
		--) shift; break ;;
		*) echo "Unknown option $1 (playwright arguments go after --)" >&2; exit 2 ;;
	esac
done
if [[ -n $prefix && ! $prefix =~ ^(/[A-Za-z0-9._~-]+)+$ ]]; then
	echo "--prefix must look like /blender or /tools/blender, not $prefix" >&2
	exit 2
fi

if ((EUID == 0)); then
	echo "Run tools/test-e2e-stack.sh as yourself, not as root (it calls sudo docker itself)." >&2
	exit 1
fi
sudo=()
docker info >/dev/null 2>&1 || sudo=(sudo)
port=${E2E_PORT:-8090}
if (exec 3<>/dev/tcp/127.0.0.1/"$port") 2>/dev/null; then
	echo "Port $port is in use: stop what uses it, or set E2E_PORT." >&2
	exit 1
fi

work=$(mktemp -d)
chmod 755 "$work" # the proxy's nginx (not you) reads its configuration from here
# A published image instead of a build: pulled, never built.
if [[ -n $image ]]; then
	printf 'services:\n  blender:\n    image: %s\n    pull_policy: always\n' "$image" > "$work/override.yaml"
else
	printf 'services:\n  blender:\n    image: trimix-blender:e2e\n' > "$work/override.yaml"
fi
app_port=$port
if [[ -n $prefix ]]; then
	# The README's sub-folder proxy, without TLS: /prefix/… forwarded to the container's root.
	app_port=$((port + 1))
	cat > "$work/proxy.conf" <<NGINX
pid /tmp/nginx.pid;
error_log stderr warn;
events {}
http {
    client_body_temp_path /tmp/cb; proxy_temp_path /tmp/p; fastcgi_temp_path /tmp/f;
    uwsgi_temp_path /tmp/u; scgi_temp_path /tmp/s;
    access_log off;
    server {
        listen 8080;
        location = $prefix { return 301 $prefix/; }
        location $prefix/ {
            proxy_pass http://blender:8080/;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host \$host;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header X-Forwarded-For \$remote_addr;
        }
    }
}
NGINX
	chmod 644 "$work/proxy.conf"
	cat >> "$work/override.yaml" <<YAML
  proxy:
    image: dhi.io/nginx:1.31.8-alpine3.24
    entrypoint: [nginx, -c, /etc/proxy/nginx.conf, -e, stderr, -g, 'daemon off;']
    volumes: ['$work/proxy.conf:/etc/proxy/nginx.conf:ro']
    ports: ['127.0.0.1:$port:8080']
    read_only: true
    tmpfs: [/tmp]
    depends_on: [blender]
YAML
fi

# Shown on the About page, as tools/docker-dev.sh: the tag of a clean checkout, else dev.
commit=$(git -C "$root" rev-parse --short HEAD 2>/dev/null || true) # none: the build time (vite.config.ts)
version=""
if [[ -z $(git -C "$root" status --porcelain 2>/dev/null) ]]; then
	version=$(git -C "$root" describe --tags --exact-match 2>/dev/null || true)
elif [[ -n $commit ]]; then
	commit+=-dirty
fi

run_compose() {
	"${sudo[@]}" env BLENDER_PORT="$app_port" APP_VERSION="$version" APP_COMMIT="$commit" \
		docker compose -p blender-e2e -f "$root/docker-compose.yaml" -f "$work/override.yaml" "$@"
}

cleanup() {
	run_compose down --remove-orphans >/dev/null 2>&1 || true
	rm -rf "$work"
}
trap cleanup EXIT

if [[ -n $image ]]; then
	echo "Starting the published image $image …"
	run_compose up -d --no-build
else
	echo "Building and starting the image from this checkout${prefix:+, behind a proxy under $prefix/} …"
	run_compose up -d --build
fi

# Up when the container answers /health (through the proxy with --prefix).
health="http://127.0.0.1:$port$prefix/health"
for _ in $(seq 1 60); do
	curl -sf -o /dev/null "$health" && break
	sleep 1
done
curl -sf -o /dev/null "$health" || {
	echo "The container did not answer within 60 s:" >&2
	run_compose ps >&2
	run_compose logs --tail 40 >&2 || true
	exit 1
}

url="http://localhost:$port$prefix/"
echo "Testing $url …"
cd "$root"
E2E_BASE_URL=$url npx playwright test "$@" || {
	status=$?
	echo "Failed. The container's last log lines:" >&2
	run_compose logs --tail 40 >&2 || true
	exit $status
}
