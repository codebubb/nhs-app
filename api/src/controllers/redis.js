import Redis from 'ioredis';
const redis = new Redis();
redis.get('test').then(console.log);