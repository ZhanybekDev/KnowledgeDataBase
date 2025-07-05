import { io, Socket } from "socket.io-client";
import type { App } from "vue";
import type { ManagerOptions, SocketOptions } from "socket.io-client";

interface Options {
  uri: string;
  opts?: Partial<ManagerOptions & SocketOptions>;
}

export default {
  install(app: App, options: Options) {
    // 1) Создаём сокет, но не коннектимся автоматически
    const socket: Socket = io(options.uri, {
      ...options.opts,
      autoConnect: false
    });

    // 2) Сохраняем в глобалы и provide
    app.config.globalProperties.$socket = socket;
    app.provide("socket", socket);

    // 3) Обработка ошибок авторизации
    socket.on("connect_error", async (err: Error & { message: string }) => {
      if (err.message === "unauthorized" || err.message === "session_exist") {
        // попробуем обновить токен и реконнект
        await isTokenReady();
        const freshToken = await getToken();
        socket.auth = { jwt: freshToken };
        socket.connect();
      }
    });

    // 4) Слушаем успешное подключение
    socket.on("connect", () => {
      console.log("Socket connected with id:", socket.id);
    });

    // 5) Финальный коннект
    socket.connect();
  }
};
