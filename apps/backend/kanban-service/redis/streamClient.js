// redis/streamClient.js
const Redis = require('ioredis');

const stream = new Redis({
  host: 'localhost', // or 'host.docker.internal' if Redis runs in Docker
  port: 6379
});

module.exports = stream;
