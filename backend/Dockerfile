FROM node:lts-alpine

ENV NODE_ENV=production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /app
COPY . .

RUN yarn config delete proxy && npm config rm proxy && npm config rm https-proxy
RUN yarn
RUN yarn install --production --network-timeout 1000000 && yarn global add copyfiles cross-env
RUN yarn build

ENTRYPOINT [ "yarn" ]
CMD [ "serve" ]

EXPOSE 8000
