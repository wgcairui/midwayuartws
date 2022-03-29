import { Provide, Scope, ScopeEnum, Config, Init } from '@midwayjs/decorator';
import * as redis from 'ioredis';

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisService {
  @Config('redis')
  private redisConfig: redis.RedisOptions;

  redisService: redis.Redis;

  @Init()
  async init() {
    this.redisService = new redis(this.redisConfig);
    this.redisService.setMaxListeners(20);
  }
}
