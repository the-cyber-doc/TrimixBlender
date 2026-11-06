# Trimix Blender: the static PWA served by nginx, plain HTTP on 8080, behind your TLS proxy.
#   docker build -t trimix-blender .
#   docker build -t trimix-blender --build-arg BASE_PATH=/blender .   (served under /blender/)
#
# Base images: Docker Hardened Images (dhi.io), as VideoNinja; building needs
# `docker login dhi.io` (a free Docker account). The final image is nginx and the built
# files only: no Node, no build tool. Runs as UID 10001 on a read-only filesystem.

# The app, built for the base path (links, service worker scope).
FROM dhi.io/node:26.13.0-alpine3.24-dev AS build
USER root
ARG BASE_PATH=
ARG APP_VERSION=
ARG APP_COMMIT=unknown
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Unit tests first: a failing formula never ships.
RUN BASE_PATH= npx vitest run \
    && BASE_PATH="${BASE_PATH}" APP_VERSION="${APP_VERSION}" APP_COMMIT="${APP_COMMIT}" npm run build \
    && chmod -R u=rwX,go=rX build

FROM dhi.io/nginx:1.31.8-alpine3.24 AS runtime

# nginx's configuration for the base path, checked by the runtime's own nginx (nginx -t):
# a broken configuration fails the build, not the start.
FROM runtime AS config
USER 0:0
ARG BASE_PATH=
COPY nginx.conf /etc/blender/nginx.conf
RUN sed -i "s#__BASE__#${BASE_PATH}#g" /etc/blender/nginx.conf \
    && chmod 644 /etc/blender/nginx.conf \
    && nginx -t -c /etc/blender/nginx.conf -e stderr

FROM runtime
ARG BASE_PATH=
COPY --from=build /src/build/ /srv/www${BASE_PATH}/
COPY --from=config /etc/blender/nginx.conf /etc/blender/nginx.conf
USER 10001:10001
EXPOSE 8080
ENTRYPOINT []
CMD ["nginx", "-c", "/etc/blender/nginx.conf", "-e", "stderr", "-g", "daemon off;"]
