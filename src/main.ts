import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from "primevue/config";
import Aura from '@primeuix/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import { createPinia } from 'pinia'
import '@/assets/styles.scss';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app')
