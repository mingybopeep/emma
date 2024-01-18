
FROM node:latest 

WORKDIR /app

# default to port for node
ARG PORT=8765
ENV PORT $PORT
EXPOSE $PORT

COPY package*.json /app/

RUN npm ci

# check every 30s to ensure this service returns HTTP 200
# HEALTHCHECK --interval=30s \
#     CMD node healthcheck.js

# copy source code last, as it changes the most
COPY . .

RUN npm run build

