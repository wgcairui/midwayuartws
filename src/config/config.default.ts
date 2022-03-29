import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1648102436743_1323',
  koa: {
    port: 9011,
    hostname: '0.0.0.0',
  },
  redis: {
    port: 6379, // Redis port
    host: process.env.NODE_Docker === 'docker' ? 'redis' : '127.0.0.1', // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    password: '',
    db: 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
  ws: {
    path: '/ws',
  },
} as MidwayConfig;
