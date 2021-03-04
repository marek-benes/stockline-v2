FROM node:14-alpine as builder

## Install build toolchain, install node deps and compile native add-ons
RUN apk add --no-cache python make g++
COPY package*.json ./
RUN npm ci -production

FROM node:14-alpine as app

## Set Stockline version from command line argument as the environment variable
ARG STOCKLINE_VERSION
ENV STOCKLINE_VERSION $STOCKLINE_VERSION
ENV NODE_ENV production

## Set working directory
WORKDIR /usr/src/app

## Copy built node modules and binaries without including the toolchain
COPY --from=builder node_modules ./node_modules

## Copy dist files
COPY dist ./dist

## Cleanup dist, install ffmpeg
RUN rm -f -r ./dist/tools