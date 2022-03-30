import {
  WSController,
  Provide,
  OnWSConnection,
  Inject,
  OnWSMessage,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';
import { MQ, WsEvent } from '../service/bullMQ';

@Provide()
@WSController()
export class HelloSocketController {
  @Inject()
  ctx: Context;

  @Inject()
  MQ: MQ;

  @OnWSConnection()
  async onConnectionMethod() {
    this.ctx.send(JSON.stringify({ type: 'Connection' }));
  }

  @OnWSMessage('message')
  async gotMessage(data: Buffer) {
    const obj = data.toString();
    if (/^{.*}$/.test(obj)) {
      const data = JSON.parse(obj) as WsEvent;
      if (!data.token) throw new Error('message Error');
      this.MQ.socketMap.set(data.token, this.ctx);
      this.MQ.addJob(data);
    }
  }
}
