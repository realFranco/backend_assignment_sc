ARG NODE_VERSION=22.3

FROM node:$NODE_VERSION-alpine3.20 AS cli

VOLUME /app
WORKDIR /app

RUN apk update --no-cache && \
    apk add --no-cache \
        gcc=13.2.1_git20240309-r0 \
        musl-dev=1.2.5-r0 \
        libffi-dev=3.4.6-r0 \
        bash=5.2.26-r0
        # python3=3.12.3-r1 \
        # python3-dev=3.12.3-r1
        # py3-pip \
        # postgresql-libs \
        # postgresql-dev

# ADD . /app

COPY package.json ./
COPY package-lock.json ./
# COPY ./app/package.json .

RUN npm install

CMD ["node", "src/app"]
