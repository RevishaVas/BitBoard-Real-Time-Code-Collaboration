const { createClient } = require('redis');
require('dotenv').config(); // If using .env

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const pub = createClient({ url: redisUrl });
const sub = pub.duplicate(); // For subscribing

// Connect both clients
pub.connect();
sub.connect();

// Optional: logging
pub.on('connect', () => console.log('Redis PUB connected'));
sub.on('connect', () => console.log('Redis SUB connected'));

module.exports = { pub, sub };
