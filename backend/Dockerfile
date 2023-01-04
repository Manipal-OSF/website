FROM node:lts-alpine

ENV NODE_ENV=production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /app
COPY . .

RUN yarn install --production && yarn global add copyfiles cross-env
RUN yarn build

ENTRYPOINT [ "yarn" ]
CMD [ "serve" ]

EXPOSE 8000
