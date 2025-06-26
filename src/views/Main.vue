<script setup lang="ts">
import { onMounted } from 'vue'
import { useGeneralStore } from '@/store/generalStore.ts'
</script>

<template>
  <RouterLink to="settings/model">
    <Button label="Настройки" />
  </RouterLink>
</template>

<style scoped>
</style>