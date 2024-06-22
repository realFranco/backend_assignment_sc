ARG NODE_VERSION=22.3

FROM node:$NODE_VERSION-alpine3.20 AS cli

RUN apk update --no-cache && \
    apk add --no-cache \
        # make=4.4.1-r2 \
        # yamllint=1.35.1-r1 \
        gcc=13.2.1_git20240309-r0 \
        musl-dev=1.2.5-r0 \
        libffi-dev=3.4.6-r0 \
        # python3=3.12.3-r1 \
        # python3-dev=3.12.3-r1 \
        bash=5.2.26-r0 \
        postgresql16-client=16.3-r0

WORKDIR /app

# EXPOSE 7000
