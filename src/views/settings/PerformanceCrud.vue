<script setup lang="ts">
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import { onMounted, ref } from 'vue'
import { usePerformanceStore } from '@/store/performancesStore.ts'
import { formatDatetime } from '@/utils/date-time-format.utility.ts'
import api from '@/api/axios.ts'
import DetailComponent from '@/components/DetailComponent.vue'
import VersionInstDialog from '@/components/VersionInstDialog.vue'


const performanceStore = usePerformanceStore()
const addDialog = ref(false)

const route = ref('performance')
const selectedLanguage = ref('ru')

const performanceSetting = ref({
  title: null,
  description: null,
  mode: null,
  mode: null,
  model: null,
  instances: []
})

const activeModel = ref([])
const fetchAllActiveModel = async () => {
  try {
    const res = await api.get('/models/get-active-model')
    activeModel.value = res.data
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить активные модели', life: 3000 })
  }
}

const relateInstances = ref([]);

const fetchRelateInstances = async () => {
  if (!performanceSetting.value.model){
    return
  }
  try {
    const res = await api.get(`/instances/${performanceSetting.value.model._id}/active-instances`)
    relateInstances.value = res.data
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить активные модели', life: 3000 })
  }finally {
    performanceSetting.value.instances = []
  }
}

const openAddDialog = () => {
  addDialog.value = true
  fetchAllActiveModel()
}

const options = [
  {
    ru: 'Выборочный',
    code: 'choice',
  },
  {
    ru: 'Циклический',
    code: 'cycle',
  }
]

const closeAddDialog = () => {
  addDialog.value = false
}

const handleAddDialog = () => {
  addDialog.value = false
  route.value = 'interface'
}

onMounted(async () => {
  await performanceStore.fetchAllPerformance()
})

const op = ref(null);
const selectedForPopover = ref(null)

const toggle = (event, item) => {
  selectedForPopover.value = item
  op.value.toggle(event);
}

const clearSelectedForPopover = () => {
  selectedForPopover.value = null
}
</script>

<template>
  <template v-if="route === 'performance'">
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold mb-4">Представления</h2>
            <Button label="Создать представление"
                    icon="pi pi-plus"
                    @click="openAddDialog"
            />
        </div>
      </template>
      <template #content>
        <DataTable
          v-if="performanceStore.performances?.length"
          :value="performanceStore.performances"
          dataKey="_id"
          row-hover
          stripedRows
          responsiveLayout="scroll"
          size="small"
        >
          <Column field="title" :sortable="true" header="Название"/>
          <Column field="description" :sortable="true" header="Описание"/>
          <Column field="createdAt" :sortable="true" header="Дата создания">
            <template #body="slotProps">
              {{ formatDatetime(slotProps.data.createdAt) }}
            </template>
          </Column>
          <Column header="Действия">
            <template #body="slotProps">
              <div class="flex justify-start gap-1">
                <Button icon="pi pi-trash"
                        outlined
                        severity="danger" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="addDialog" header="Настройки представления" modal :style="{ width: '500px' }">
      <div class="flex flex-col space-y-4 p-3">
        <div class="flex flex-col">
          <label for="stringKey" class="text-sm font-medium mb-1">Название</label>
          <InputText id="stringKey" v-model="performanceSetting.title" class="w-full" />
        </div>

        <div  class="flex flex-col">
          <label class="text-sm font-medium mb-1">Описание</label>
          <Textarea autoResize cols="30" v-model="performanceSetting.description" />
        </div>

        <div class="flex flex-col">
          <label for="stringKey" class="text-sm font-medium mb-1">Режим</label>
          <Select v-model="performanceSetting.mode" :options="options" optionLabel="ru" class="w-full" />
        </div>

        <Tabs value="0">
          <TabList>
            <Tab value="0">Подключить модель</Tab>
            <Tab value="1">Без модели</Tab>
          </TabList>
          <TabPanels style="padding-inline: 0">
            <TabPanel value="0" class="p-0">
              <div class="flex flex-col space-y-4 ">
                <div class="flex flex-col">
                  <label for="stringKey" class="text-sm font-medium mb-1">Модель</label>
                  <Select v-model="performanceSetting.model"
                          @blur="fetchRelateInstances"
                          :options="activeModel" optionLabel="title" class="w-full" />
                </div>

                <div class="flex flex-col" v-if="performanceSetting.model">
                  <label for="stringKey" class="text-sm font-medium mb-1">Экземпляры</label>
                  <MultiSelect v-model="performanceSetting.instances" :options="relateInstances" optionLabel="title"
                               :maxSelectedLabels="3" class="w-full" :showToggleAll="false"/>
                </div>
              </div>
            </TabPanel>
            <TabPanel value="1">
              Без выбора
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>

      <template #footer>
        <Button label="Отмена" @click="closeAddDialog()" class="p-button-text" />
        <Button label="Добавить" @click="handleAddDialog()"/>
      </template>
    </Dialog>
  </template>

  <template v-if="route === 'interface'">
    <Splitter>
      <SplitterPanel :size="30">
        <Tabs value="0">
          <TabList>
            <Tab value="0">Свойства модели</Tab>
            <Tab value="1">Экземпляры</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="flex items-center justify-between mb-4">
                <span>Глобальная модель</span>
                <Button icon="pi pi-times" severity="danger" variant="outlined" rounded aria-label="Cancel" size="small" />
              </div>
              <div class="flex flex-col space-y-2">
                <div v-for="(value, key) in performanceSetting.model.data" :key="key">
                  <div @click="toggle($event, {[key]: value})" class="hover:cursor-pointer hover:underline">
                    {{ value.name[selectedLanguage] }}
                    <strong class="text-red-400 ml-2">${{ key }}</strong>
                  </div>
                </div>
              </div>
              <Popover ref="op" @hide="clearSelectedForPopover">
                <DetailComponent
                  :field="selectedForPopover[Object.keys(selectedForPopover)[0]]"
                  :fieldKey="Object.keys(selectedForPopover)[0]"
                  :selectedLanguage="selectedLanguage"
                />
              </Popover>
            </TabPanel>
            <TabPanel value="1">
              <template v-for="inst in performanceSetting.instances">
                <div class="flex items-center justify-between mb-4">
                  <span>{{inst.title}}</span>
                  <Button :label="inst.version" severity="danger"
                          variant="outlined" rounded aria-label="Cancel" size="small" />
                </div>
              </template>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </SplitterPanel>

      <SplitterPanel :size="70">
        <Card>
          <template #title>
            <div class="flex justify-between items-center">
              <p class="m-0">{{performanceSetting.model.title}}</p>
              <Select v-model="selectedLanguage"
                      size="small"
                      :options="performanceSetting.model.value_localization" />
            </div>
          </template>
        </Card>
      </SplitterPanel>
    </Splitter>
  </template>
</template>

<style scoped>

</style>