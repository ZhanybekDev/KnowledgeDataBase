<script setup>
import { ref } from 'vue'
import AppMenuItem from './AppMenuItem.vue'

const model = ref([
  {
    label: 'Настройки',
    items: [
      { label: 'Модели', icon: 'pi pi-fw pi-table', to: '/settings/model' },
      { label: 'Экземпляры', icon: 'pi pi-fw pi-align-left', to: '/settings/instance' },
      { label: 'Представления', icon: 'pi pi-fw pi-objects-column', to: '/settings/performance' },
      { label: 'Доступы', icon: 'pi pi-fw pi-users', to: '/settings/access' },
    ]
  }
])
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <AppMenuItem v-if="!item.separator" :item="item" :index="i"></AppMenuItem>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
