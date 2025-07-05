<script setup lang="ts">
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import { onMounted, ref } from 'vue'
import api from '@/api/axios.ts'
import { useToast } from 'primevue/usetoast'
import { formatDatetime } from '@/utils/date-time-format.utility.ts'
import Button from 'primevue/button'
import { useInstancesStore } from '@/store/instancesStore.ts'
import DetailsDialog from '@/components/DetailsDialog.vue'

interface Props {
  data: any | null;
}

const props = defineProps<Props>()
const generalStore = useGeneralStore()
const dialogs = useDialogStore()
const instancesStore = useInstancesStore()
const toast = useToast()

const versionData = ref(props.data)

const onHide = () => {
  forActive.value = null
}

const forActive = ref(null)
const showInformDialog = ref(false)

const openInformDialog = (item: any) => {
  forActive.value = item
  showInformDialog.value = true
}

const closeInformDialog = () => {
  forActive.value = null
  showInformDialog.value = false
}

const items = ref(null)

const fetchData = async () => {
  try {
    const res = await api.post(`/instances/version`, versionData.value)
    items.value = res.data
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось найти версии', life: 3000 })
  }
}

onMounted(() => {
  fetchData()
})
const versionDialog = ref(false)

const openDetailsModal = (item: any) => {
  versionData.value = item
  versionDialog.value = true
}

const save = async () => {
  const activeInst = items.value.find(item => item.is_active === true)

  try {
    await api.put(`/instances/update-version`, {
      activeInst: activeInst._id,
      forActive: forActive.value._id
    })
    closeInformDialog()
    await instancesStore.fetchAllInstances()
    dialogs.closeVersionDialog()
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось активировать версию', life: 3000 })
  }
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
            {{ slotProps.item.version }}
        </span>
      </template>
      <template #content="slotProps">
        <Card class="mt-4">
          <template #title>
            <small class="text-surface-500 dark:text-surface-400">
              {{ formatDatetime(slotProps.item.createdAt) }}
              <br>
              <template v-if="slotProps.item.is_active">
                <Badge value="Активный" severity="success"></Badge>
              </template>
              <template v-else>
                <Badge value="Не активный" class="cursor-pointer hover:bg-red-600 hover:text-white" severity="danger"
                       @click="openInformDialog(slotProps.item)"
                />
              </template>
            </small>

            <small class="text-surface-500 dark:text-surface-400 ml-1">
              <template v-if="slotProps.item.is_last">
                <Badge value="Последний" severity="severity"></Badge>
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

  <Dialog v-model:visible="showInformDialog" header="Внимание!" :dismissableMask="true" modal :style="{ width: '500px' }">
    <p>
      Этот экземпляр будет активным
    </p>
    <template #footer>
      <Button label="Отмена" @click="closeInformDialog" class="p-button-text" />
      <Button label="Подтвердить" @click="save" />
    </template>
  </Dialog>

  <Dialog v-model:visible="versionDialog" :style="{ width: '800px' }"
          :dismissableMask="true"
          :modal="true"
          @hide="onHide"
          header="Детальная информация"
  >
    <DetailsDialog :data="versionData" />
  </Dialog>
</template>

<style scoped>

</style>