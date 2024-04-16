# syntax=docker/dockerfile:1.2

# builder stage
FROM 550983980260.dkr.ecr.us-west-2.amazonaws.com/node:18 AS builder

ENV LANG en_US.UTF-8
ENV JAVA_TOOL_OPTIONS -Dfile.encoding=UTF8

USER root
WORKDIR /packages/ipa-core/src
ADD ./ /packages/ipa-core/src/
RUN --mount=type=secret,id=npm-settings,required=true,target=/root/.npmrc \
    npm install --no-package-lock && \
    npm run publish
