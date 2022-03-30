import { Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';
import { Job, Queue, QueueScheduler, Worker } from 'bullmq';
import { RedisService } from './redis';

export interface WsEvent {
  token: string;
  event?: string;
  data?: any;
}

/**
 * 消息队列
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class MQ {
  @Inject()
  private redis: RedisService;

  queue: Queue<WsEvent, any, string>;

  socketMap: Map<string, Context>;

  @Init()
  init() {
    this.socketMap = new Map();
    this.start();
  }

  private start() {
    this.queue = new Queue('wsInput', { connection: this.redis.redisService });

    new QueueScheduler('wsInput', { connection: this.redis.redisService });

    /**
     * 接受uartserver发送的事件
     */
    new Worker('wsOutput', async ({ data }: Job<WsEvent>, id: string) => {
      const { token, event } = data;
      const socket = this.socketMap.get(token);
      if (socket) {
        const data: { type: string, data: any } = { type: event, data: {} }
        socket.send(JSON.stringify(data));
      }
    }, {
      connection: this.redis.redisService,
    });
  }

  /**
   * 添加消息到队列
   * @param data
   */
  addJob(data: WsEvent) {
    this.queue.add('wsConnect', data);
  }
}
