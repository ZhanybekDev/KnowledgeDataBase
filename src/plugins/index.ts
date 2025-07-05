import router from '../router'
import type { App } from 'vue'
import { getToken, isTokenReady, vueKeycloak } from '@/plugins/keycloak'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import { createPinia } from 'pinia'
import ToastService from 'primevue/toastservice'
import SocketIO from "@/plugins/socket"

export async function registerPlugins(app: App) {
  app
    .use(createPinia())
    .use(router)
    .use(PrimeVue, {
      theme: {
        preset: Aura
      }
    })
    .use(ToastService)
    .use(ConfirmationService)

}
