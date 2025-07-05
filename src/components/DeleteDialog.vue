<script setup lang="ts">
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  deleteItem: any
}>()

const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const toast = useToast()
</script>

<template>
  <Dialog v-model:visible="dialogs.deleteDialog"
          :style="{ width: '450px' }"
          header="Удаление"
          @hide="generalStore.clearSelectedEntity()"
          :dismissableMask="true"
          :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="generalStore.selectedEntity">Вы уверены, что хотите удалить?</span>
    </div>
    <template #footer>
      <Button label="Нет" icon="pi pi-times" text @click="dialogs.closeDeleteDialog()" />
      <Button label="Да" icon="pi pi-check" @click="deleteItem()" />
    </template>
  </Dialog>
</template>

<style scoped>

</style>