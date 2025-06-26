<script setup lang="ts">
import { useGeneralStore } from '@/store/generalStore.ts'
import { onMounted } from 'vue'

const generalStore = useGeneralStore()

onMounted(async () => {
  await generalStore.getAccessData()
})
</script>

<template>
  <router-view />
</template>

<style scoped>
</style>
