<script setup lang="ts">

import { state } from '@/plugins/keycloak/state.ts'

const exit = () => {
  if (!confirm("Вы действительно хотите выйти?")) return;
  let origin = location.href;
  const params = state.idToken
    ? `?id_token_hint=${state.idToken}&post_logout_redirect_uri=${origin}`
    : "";
  const ccidUrl = import.meta.env.VITE_CCID_URL;
  const ccidRealm = import.meta.env.VITE_CCID_REALM;
  location.replace(
    `${ccidUrl}/realms/${ccidRealm}/protocol/openid-connect/logout${params}`,
  );
  localStorage.removeItem("rightBar");
};

</script>

<template>
  <div class="flex gap-3">
    <RouterLink to="settings/model">
      <Button label="Настройки" />
    </RouterLink>

    <Button label="Выйти" @click="exit"/>
  </div>
</template>

<style scoped>
</style>