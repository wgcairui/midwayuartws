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
    new Worker('wsOutput', this.initWork, {
      connection: this.redis.redisService,
    });
  }

  /**
   * 初始化消费程序
   * @param job 队列信息
   * @param id 队列id
   */
  private async initWork({ data }: Job<WsEvent>, id: string) {
    console.log({ data, id });
    const { token, event } = data;
    const socket = this.socketMap.get(token);
    if (socket) {
      socket.send(event);
    }
  }

  /**
   * 添加消息到队列
   * @param data
   */
  addJob(data: WsEvent) {
    this.queue.add('wsConnect', data);
  }
}
