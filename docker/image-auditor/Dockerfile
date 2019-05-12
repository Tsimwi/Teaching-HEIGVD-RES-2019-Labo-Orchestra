FROM node:4.3.1

COPY ../../src/auditor.js /opt/app/
COPY ../../package.json /opt/app/

WORKDIR /opt/app/
RUN npm install

EXPOSE 2205

ENTRYPOINT ["node", "/opt/app/auditor.js"]