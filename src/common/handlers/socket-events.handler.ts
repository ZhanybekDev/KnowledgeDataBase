import { Socket } from "socket.io-client";

export class SocketEventsHandler {
  public socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  async emitAndWait(event: string, data: any, timeout = 5000): Promise<any> {
    try {
      return await this.socket.timeout(timeout).emitWithAck(event, { ...data });
    } catch (err) {
      console.error(event, err);
    }
  }

  emit(event: string, data: any) {
    return this.socket.emit(event, { data });
  }
}
