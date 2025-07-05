<script setup lang="ts">
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import { computed, onMounted, ref } from 'vue'
import { usePerformanceStore } from '@/store/performancesStore.ts'
import { formatDatetime } from '@/utils/date-time-format.utility.ts'
import api from '@/api/axios.ts'
import DetailComponent from '@/components/DetailComponent.vue'
import VersionInstDialog from '@/components/VersionInstDialog.vue'
import { useDialogStore } from '@/store/dialogStore.ts'

const dialogs = useDialogStore()
const performanceStore = usePerformanceStore()

const route = ref('performance')

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

const selectedLanguage = ref('ru')

const textGay = ref(null);
const viewOptions = ref([
  {
    label: 'Шаблон',
    value: 'model'
  },
  {
    label: 'Экземпляры',
    value: 'instances'
  }
]);

const items = computed(() => {
  return [
    { label: 'Представления', route: "performance" },
    { label: performanceSetting.value.model?.title, route: "interface" }
  ]
})

const menu = ref()
const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}
const menuItems = [
  {
    label: 'Текстовый блок',
    icon: 'pi pi-stop',
    command: () => {
      openTextBlockDialog()
    }
  },
  {
    label: 'Таблица',
    icon: 'pi pi-table',
    command: () => {
      openTableBlockDialog()
    }
  },
  {
    label: 'Сравнительная таблица',
    icon: 'pi pi-list-check',
    command: () => {
      openComparisonTableDialog()
    }
  }
]


const addDialog = ref(false)
const openAddDialog = () => {
  addDialog.value = true
  fetchAllActiveModel()
}
const closeAddDialog = () => {
  addDialog.value = false
}
const handleAddDialog = () => {
  addDialog.value = false
  route.value = 'interface'
}


const interfaceBlock = ref([])
const performanceSetting = ref({
  title: null,
  description: null,
  mode: null,
  model: null,
  instances: []
})
const textBlock = ref({
  title: null,
  description: null,
  mode: null,
  model: null,
  instances: []
})
const tableBlock = ref({
  title: null,
  description: null,
  mode: null,
  model: null,
  instances: []
})

const comparisonBlock = ref({
  title: null,
  mode: null,
  model: null,
  instances: [],
  properties: [],
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


const textBlockDialog = ref(false)
const openTextBlockDialog = () => {
  textBlockDialog.value = true
}
const closeTextBlockDialog = () => {
  textBlockDialog.value = false
}
const handleTextBlockDialog = () => {
  interfaceBlock.value.push({
    type: "text",
    view: "model",
    fullScreen: false,
    data: comparisonBlock.value
  })
  textBlockDialog.value = false
}

const tableBlockDialog = ref(false)
const openTableBlockDialog = () => {
  tableBlockDialog.value = true
}
const closeTableBlockDialog = () => {
  tableBlockDialog.value = false
}
const handleTableBlockDialog = () => {
  interfaceBlock.value.push({
    type: "table",
    view: "tabs",
    fullScreen: false,
    data: tableBlock.value
  })
  tableBlockDialog.value = false
}

const comparisonTableDialog = ref(false)
const openComparisonTableDialog = () => {
  comparisonTableDialog.value = true
}
const closeComparisonTableDialog = () => {
  comparisonTableDialog.value = false
}
const handleComparisonTableDialog = () => {
  interfaceBlock.value.push({
    type: "comparison",
    view: "model",
    fullScreen: false,
    data: textBlock.value
  })
  comparisonTableDialog.value = false
}

const comparisonProperties = computed<any[]>(() => {
  // Защищаемся от случая, когда model или data ещё не пришли
  const modelData = comparisonBlock.value.model?.data ?? {}

  // Превращаем { fieldName: { title: '...' , …}, … } в [{ key: fieldName, title: '…' }, …]
  return Object.entries(modelData).map(([key, prop]) => {

    console.log('key', key)
    console.log('prop', prop)
    return {
      key,
      title: prop.name.ru
    }
  })
})

const versionData = ref(null)
const openVersionModal = (item: any) => {
  versionData.value = item
  if(typeof versionData.value.parent_instance !== 'object')
  versionData.value.parent_instance = {
    id: versionData.value.parent_instance
  }
  dialogs.openVersionDialog()
}

const relateInstances = ref([]);
const fetchRelateInstances = async () => {
  try {
    const res = await api.get(`/instances/${performanceSetting.value.model._id}/active-instances`)
    relateInstances.value = res.data
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить активные модели', life: 3000 })
  }
}


const propertyInfo = ref(null);
const selectedForPopover = ref(null)
const toggle = (event, item) => {
  selectedForPopover.value = item
  propertyInfo.value.toggle(event);
}
const clearSelectedForPopover = () => {
  selectedForPopover.value = null
}

const informData = ref(null)
const informBlockDialog = ref(false)
const openInformBlockDialog = (block, index) => {
  informData.value = {
    data: block,
    index
  }
  informBlockDialog.value = true
}
const closeInformBlockDialog = () => {
  informBlockDialog.value = false
}
const handeInformBlockDialog = () => {
  return alert('hello')
}
const removeBlock = (index) => {
  interfaceBlock.value = interfaceBlock.value.filter((_, i) => i !== index)
  closeInformBlockDialog()
}


const createTableDialog = ref(false)
const openCreateTableDialog = () => {
  createTableDialog.value = true
}
const closeCreateTableDialog = () => {
  createTableDialog.value = false
}

const numCols = ref<number | null>(null)
const numRows = ref<number | null>(null)

const tableData = ref<any>({
  header: [],
  content: []
})

function generateTable() {
  if (!numCols.value || !numRows.value) return
  tableData.value.header = Array.from({ length: numCols.value }, (_, i) => ({
    field: `col${i + 1}`,
    label: ''
  }))

  tableData.value.content = Array.from({ length: numRows.value }, () => {
    const row: Record<string, string> = {}
    tableData.value.header.forEach(col => { row[col.field] = '' })
    return row
  })

  closeCreateTableDialog()
}

const comparisonColumns = computed(() => [
  { field: 'title', header: 'Название экземпляра' },
  ...comparisonBlock.value.properties.map(prop => ({
    field: prop.key,
    header: prop.title
  }))
])

const tableRows = computed(() => {
  return comparisonBlock.value.instances.map(inst => {
    const row: Record<string, any> = {
      title: inst.title
    }
    comparisonBlock.value.properties.forEach(prop => {
      const cell = inst.data[prop.key]
      row[prop.key] = cell?.value?.[selectedLanguage.value] ?? ''
    })
    return row
  })
})

onMounted(async () => {
  await performanceStore.fetchAllPerformance()
})
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
  </template>

  <template v-if="route === 'interface'">
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <div class="flex justify-center">
            <Breadcrumb :model="items" style="padding: 0 0 10px 0">
              <template #item="{ item }">
                <span class="cursor-pointer hover:underline text-base" @click="() => route = item.route">{{item.label}}</span>
              </template>
              <template #separator> > </template>
            </Breadcrumb>
          </div>

          <div class="flex gap-3 items-center">
            <Select v-model="selectedLanguage"
                    size="small"
                    :options="performanceSetting.model.value_localization" />

            <Button size="small"
                    icon="pi pi-pencil"
                    @click="openAddDialog"
            />
          </div>
        </div>
      </template>

      <template #content>
        <Splitter style="height: 100%">
          <SplitterPanel :size="30">
            <Tabs value="0">
              <TabList>
                <Tab value="0">Свойства модели</Tab>
                <Tab value="1">Экземпляры</Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="0">
                  <div class="flex flex-col space-y-2">
                    <div v-for="(value, key) in performanceSetting.model.data" :key="key">
                      <div @click="toggle($event, {[key]: value})" class="hover:cursor-pointer hover:underline">
                        {{ value.name[selectedLanguage] }}
                        <strong class="text-red-400 ml-2">${{ key }}</strong>
                      </div>
                    </div>
                  </div>
                  <Popover ref="propertyInfo" @hide="clearSelectedForPopover">
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
                              variant="outlined"
                              @click="openVersionModal(inst)"
                              rounded aria-label="Cancel" size="small" />
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
                  <p class="m-0">{{performanceSetting.title}}</p>
                </div>
              </template>

              <template #content>
                <div class="flex flex-col gap-3">
                <template v-for="(block, index) in interfaceBlock">
                  <div v-if="block.type === 'text'">
                      <Card class="border border-gray-700">
                        <template #title>
                          <div class="flex justify-between items-center">
                            <p>{{ block.data.title }}</p>

                            <div class="flex gap-2 items-center">
                              <SelectButton size="small" v-model="block.view" :options="viewOptions" option-label="label" option-value="value" />

                              <Button size="small" icon="pi pi-arrow-up-right-and-arrow-down-left-from-center" @click="() => block.fullScreen = true" />

                              <Button size="small" icon="pi pi-ellipsis-v" @click="openInformBlockDialog(block, index)"/>
                            </div>
                          </div>
                        </template>

                        <template #content>
                          <div class="flex flex-col gap-3">
                            <template v-for="inst in performanceSetting.instances">
                              <div>
                                <Chip :label="inst.title"/>
                                <Textarea v-model="textGay" class="w-full mt-2" placeholder="Введите текст" :rows="10"/>
                              </div>

                              <Drawer v-model:visible="block.fullScreen" header="Drawer" position="full">
                                <Textarea v-model="textGay" class="w-full h-full" placeholder="Введите текст"/>
                              </Drawer>
                            </template>
                          </div>
                        </template>
                      </Card>
                    </div>

                  <div v-if="block.type === 'table'">
                    <Card class="border border-gray-700">
                      <template #title>
                        <div class="flex justify-between items-center">
                          <p>{{ block.data.title }}</p>

                          <div class="flex gap-2 items-center">
                            <SelectButton size="small" v-model="block.view" :options="viewOptions" option-label="label" option-value="value" />
                            <Button label="Редактировать таблицу" v-if="tableData.header.length" @click="openCreateTableDialog" />
                            <Button size="small" icon="pi pi-ellipsis-v" @click="openInformBlockDialog(block, index)"/>
                          </div>
                        </div>
                      </template>

                      <template #content>
                        <template v-if="!tableData.header.length">
                          <Button size="small" label="Создать таблицу" @click="openCreateTableDialog"/>
                        </template>

                        {{tableData}}
                        <DataTable
                          v-if="tableData.header.length"
                          :value="tableData.content"
                          class="w-full"
                        >
                          <Column
                            v-for="col in tableData.header"
                            :key="col.field"
                            :field="col.field"
                          >
                            <template #header>
                              <InputText
                                v-model="col.label"
                                class="w-full"
                                placeholder="Введите название столбца"
                              />
                            </template>
                            <!-- Ячейка таблицы -->
                            <template #body="slot">
                              <InputText
                                class="w-full"
                                v-model="slot.data[col.field]" />
                            </template>
                          </Column>
                        </DataTable>
                      </template>
                    </Card>
                  </div>

                  <div v-if="block.type === 'comparison'">
                    <Card class="border border-gray-700">
                      <template #title>
                        <div class="flex justify-between items-center">
                          <p>{{ block.data.title }}</p>
                        </div>
                      </template>

                      <template #content>
                        <DataTable :value="tableRows">
                          <Column
                            v-for="col in comparisonColumns"
                            :key="col.field"
                            :field="col.field"
                            :header="col.header"
                          />
                        </DataTable>
                      </template>
                    </Card>
                  </div>
                </template>
                </div>
              </template>

              <template #footer>
                <div>
                  <Button
                    label="Добавить блок"
                    icon="pi pi-plus"
                    @click="toggleMenu"
                    class="p-button-sm"
                  />
                  <Menu ref="menu" :model="menuItems" :popup="true" />
                </div>
              </template>
            </Card>
          </SplitterPanel>
        </Splitter>
      </template>
    </Card>
  </template>

  <VersionInstDialog :data="versionData" v-if="dialogs.versionDialog"/>

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

  <Dialog v-model:visible="informBlockDialog" header="Информация блока" modal :style="{ width: '500px' }">
    <template #header>
      <h4 class="m-0">Информация блока</h4>

      <Button icon="pi pi-trash" severity="danger" @click="removeBlock(informData.index)" size="small" />
    </template>

      {{informData}}

    <template #footer>
      <Button label="Отмена" @click="closeInformBlockDialog()" class="p-button-text" />
      <Button label="Сохранить" @click="handeInformBlockDialog()"/>
    </template>
  </Dialog>

  <Dialog v-model:visible="textBlockDialog" header="Настройка текстового блока" modal :style="{ width: '500px' }">
    <div class="flex flex-col space-y-4 p-3">
      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Название</label>
        <InputText id="stringKey" v-model="textBlock.title" class="w-full" />
      </div>

      <div  class="flex flex-col">
        <label class="text-sm font-medium mb-1">Описание</label>
        <Textarea autoResize cols="30" v-model="textBlock.description" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Режим</label>
        <Select v-model="textBlock.mode" :options="options" optionLabel="ru" class="w-full" />
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
                <Select v-model="textBlock.model"
                        @blur="fetchRelateInstances"
                        :options="activeModel" optionLabel="title" class="w-full" />
              </div>

              <div class="flex flex-col" v-if="textBlock.model">
                <label for="stringKey" class="text-sm font-medium mb-1">Экземпляры</label>
                <MultiSelect v-model="textBlock.instances" :options="relateInstances" optionLabel="title"
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
      <Button label="Отмена" @click="closeTextBlockDialog()" class="p-button-text" />
      <Button label="Добавить" @click="handleTextBlockDialog()"/>
    </template>
  </Dialog>

  <Dialog v-model:visible="tableBlockDialog" header="Настройка табличного блока" modal :style="{ width: '500px' }">
    <div class="flex flex-col space-y-4 p-3">
      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Название</label>
        <InputText id="stringKey" v-model="tableBlock.title" class="w-full" />
      </div>

      <div  class="flex flex-col">
        <label class="text-sm font-medium mb-1">Описание</label>
        <Textarea autoResize cols="30" v-model="tableBlock.description" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Режим</label>
        <Select v-model="tableBlock.mode" :options="options" optionLabel="ru" class="w-full" />
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
                <Select v-model="tableBlock.model"
                        @blur="fetchRelateInstances"
                        :options="activeModel" optionLabel="title" class="w-full" />
              </div>

              <div class="flex flex-col" v-if="tableBlock.model">
                <label for="stringKey" class="text-sm font-medium mb-1">Экземпляры</label>
                <MultiSelect v-model="tableBlock.instances" :options="relateInstances" optionLabel="title"
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
      <Button label="Отмена" @click="closeTableBlockDialog()" class="p-button-text" />
      <Button label="Добавить" @click="handleTableBlockDialog()"/>
    </template>
  </Dialog>

  <Dialog v-model:visible="createTableDialog" header="Создание таблицы" modal :style="{ width: '500px' }">
    <div class="flex flex-col gap-3">
      <InputNumber v-model="numCols" :min="1" placeholder="Колоны" showButtons/>
      <InputNumber v-model="numRows" :min="1" placeholder="Строки" showButtons/>
    </div>

    <template #footer>
      <Button label="Отмена" @click="closeCreateTableDialog()" class="p-button-text" />
      <Button label="Добавить" @click="generateTable()"/>
    </template>
  </Dialog>

  <Dialog v-model:visible="comparisonTableDialog" header="Настройка Сравнительная таблица" modal :style="{ width: '700px' }">
    <div class="flex flex-col space-y-4 p-3">
      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Название</label>
        <InputText id="stringKey" v-model="comparisonBlock.title" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Режим</label>
        <Select v-model="comparisonBlock.mode" :options="options" optionLabel="ru" class="w-full" />
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
                <Select v-model="comparisonBlock.model"
                        @blur="fetchRelateInstances"
                        :options="activeModel" optionLabel="title" class="w-full" />
              </div>

              <div class="flex flex-col" v-if="comparisonBlock.model">
                <label for="stringKey" class="text-sm font-medium mb-1">Экземпляры</label>
                <MultiSelect v-model="comparisonBlock.instances" :options="relateInstances" optionLabel="title"
                             :maxSelectedLabels="3" class="w-full" :showToggleAll="false"/>
              </div>

              {{comparisonProperties}}
              <div class="flex flex-col" v-if="comparisonBlock.model">
                <label for="stringKey" class="text-sm font-medium mb-1">Свойсва</label>
                <MultiSelect v-model="comparisonBlock.properties" :options="comparisonProperties" optionLabel="title"
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
      <Button label="Отмена" @click="closeComparisonTableDialog()" class="p-button-text" />
      <Button label="Добавить" @click="handleComparisonTableDialog()"/>
    </template>
  </Dialog>
</template>

<style scoped>

</style>