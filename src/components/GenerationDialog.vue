<script setup lang="ts">
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import { onMounted, ref } from 'vue'
import api from '@/api/axios.ts'
import { useToast } from 'primevue/usetoast'
import { formatDatetime } from '@/utils/date-time-format.utility.ts'
import DetailsDialog from '@/components/DetailsDialog.vue'

const generalStore = useGeneralStore()
const dialogs = useDialogStore()
const toast = useToast()

const onHide = () => {
  generalStore.clearSelectedEntity()
}
const items = ref(null)

const fetchData = async () => {
  try {
    const res = await api.post(`/models/generation`, generalStore.selectedEntity)
    items.value = res.data
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось найти версии', life: 3000 })
  }
}

onMounted(() => {
  fetchData()
})

const openDetailsModal = (item: any) => {
  generalStore.selectedEntity = item
  dialogs.openDetailsDialog()
}
</script>

<template>
  <Dialog v-model:visible="dialogs.versionDialog" :style="{ width: '700px' }"
          :dismissableMask="true"
          header="Версии"
          :modal="true"
          @hide="onHide"
  >
    <Timeline :value="items" align="alternate" class="customized-timeline">
      <template #marker="slotProps">
        <span class="flex w-10 h-10 items-center justify-center text-white rounded-full z-10 shadow-sm"
              :style="{ backgroundColor: 'red' }">
            {{ slotProps.item.generation }}
        </span>
      </template>
      <template #content="slotProps">
        <Card class="mt-4">
          <template #title>
            <small class="text-surface-500 dark:text-surface-400">
              {{ formatDatetime(slotProps.item.createdAt) }}
              <template v-if="slotProps.item.is_active">
                <Badge value="Активный" severity="success"></Badge>
              </template>
              <template v-else>
                <Badge value="Не активный" severity="danger"/>
              </template>
            </small>
            <br>
            <span class="font-semibold hover:text-blue-500 hover:underline cursor-pointer"
                  @click="openDetailsModal(slotProps.item)"
            >
              {{ slotProps.item.title }}
            </span>
          </template>
          <template #subtitle>
            {{ slotProps.item.comment }}
          </template>
        </Card>
      </template>
    </Timeline>
  </Dialog>
  <Dialog v-model:visible="dialogs.detailsDialog" :style="{ width: '800px' }"
          :dismissableMask="true"
          :modal="true"
          @hide="onHide"
          header="Детальная информация"
  >
    <DetailsDialog :data="generalStore.selectedEntity" />
  </Dialog>
</template>

<style scoped>

</style>