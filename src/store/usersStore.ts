import {defineStore} from "pinia";
import {inject, ref} from "vue";
import {Socket} from "socket.io-client";
import {DefaultEventsMap} from "@/plugins/socket";
import {IUser, IUserState, State, UserWsEvent, UserWsResponse} from "@/common/types/user.interface";

export const useUserStore = defineStore("user", () => {
  const socket: Socket<DefaultEventsMap, DefaultEventsMap> | undefined = inject("socket")
  socket.on("user:info", (userData) => {
    console.log("Авторизованный юзер через WS:", userData);
  });

  return {
  }
})
