FROM node:4.3.1

COPY ../../src/musician.js /opt/app/
COPY ../../package.json /opt/app/

WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/musician.js"]
