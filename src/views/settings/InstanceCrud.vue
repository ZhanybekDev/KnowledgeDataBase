<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios.js'
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import AddComponent from '@/components/AddComponent.vue'
import { useInstancesStore } from '@/store/instancesStore.ts'
import DetailsDialog from '@/components/DetailsDialog.vue'
import DeleteDialog from '@/components/DeleteDialog.vue'
import type { EntityModel, ModeType } from '@/types/general-interface.ts'
import VersionInstDialog from '@/components/VersionInstDialog.vue'
import { useModelsStore } from '@/store/modelsStore.ts'

const toast = useToast()

const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const instancesStore = useInstancesStore()
const modelsStore = useModelsStore()

const mode = ref<ModeType>('instance')

const addRelatedInstance = () => {
  const { _id, parent_instance, parent_model } = generalStore.selectedEntity
  generalStore.selectedEntity = {
    ...generalStore.selectedEntity,
    parent_instance: parent_instance.id,
    previous_instance: _id,
    is_active: false,
    is_last: true,
    parent_model: parent_model.id
  }
  mode.value = 'relatedInstance'
  dialogs.openAddItemDialog()
}

function confirmDeleteItem(item: EntityModel) {
  generalStore.selectedEntity = item;
  dialogs.openDeleteDialog()
}

const deleteItem = async () => {
  try {
    await api.put(`/instances/remove?id=${generalStore.selectedEntity?._id}`)
    await instancesStore.fetchAllInstances()
    generalStore.clearSelectedEntity()
    dialogs.closeDeleteDialog()
    toast.add({ severity: 'success', summary: 'info', detail: 'Успешно удалено', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось удалить', life: 3000 })
  }
}

const allActiveModel = ref<any[]>([])
const filteredModels = ref<any[]>([])
const selectedActiveModel = ref<any>(null)

const filterActiveModel = (event: { query: string }) => {
  const query = event.query.toLowerCase()

  filteredModels.value = allActiveModel.value.filter((model) =>
    model.title.toLowerCase().includes(query)
  )
}

const openAddInstancesDialog = async () => {
  dialogs.addInstDialog = true
  try {
    const res = await api.get(`/models/get-active-model`)
    allActiveModel.value = res.data
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось получить модели', life: 3000 })
  }
}

const addInstance = () => {
  const { _id } = selectedActiveModel.value
  selectedActiveModel.value = {
    ...selectedActiveModel.value,
    title: '',
    parent_model: _id,
    version: '1.0.0',
    previous_instance: null,
    parent_instance: null,
    is_active: true,
    is_last: true,
  }
  delete selectedActiveModel.value.generation
  delete selectedActiveModel.value.previous_model
}

const clearAllData = () =>{
  filteredModels.value = []
  selectedActiveModel.value = null
}

onMounted(async () => {
  await instancesStore.fetchAllInstances()
})

const openDetailsModal = (item: any) => {
  const { updatedAt, createdAt, ...cleanedItem } = item.data
  generalStore.selectedEntity = cleanedItem
  dialogs.openDetailsDialog()
}

const openVersionModal = (item: any) => {
  generalStore.selectedEntity = item
  dialogs.openVersionDialog()
}

const onHide = () => {
  generalStore.clearSelectedEntity()
  modelsStore.clearInitialData()
}
</script>

<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold mb-4">Модели</h2>
        <Button label="Создать экземпляр"
                icon="pi pi-plus"
                @click="openAddInstancesDialog" />
      </div>
    </template>

    <template #content>
      <DataTable
        v-if="instancesStore.instances.length"
        :value="instancesStore.instances"
        dataKey="_id"
        row-hover
        stripedRows
        responsiveLayout="scroll"
        size="small"
        @row-click="openDetailsModal"
      >
        <Column field="title" :sortable="true" header="Название" />
        <Column field="value_localization" header="Языки">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <template v-for="tag in slotProps.data.value_localization">
                <Tag :value="tag" />
              </template>
            </div>
          </template>
        </Column>
        <Column field="version" :sortable="true" header="Версии">
          <template #body="slotProps">
            <Button outlined
                    :label="slotProps.data.version"
                    severity="info"
                    @click="openVersionModal(slotProps.data)"
            />
          </template>
        </Column>
        <Column :sortable="true" header="Метки">
          <template #body="slotProps">
            <div class="flex flex-col gap-2">
              <Tag v-if="slotProps.data.is_active" severity="success" value="Активный"></Tag>
              <Tag v-if="!slotProps.data.is_active" severity="success" value="Активный"></Tag>
              <Tag v-if="slotProps.data.is_last" severity="warn" value="Последний"></Tag>
            </div>
          </template>
        </Column>
        <Column field="parent_model" header="Родительская модель">
          <template #body="slotProps">
            {{slotProps.data.parent_model?.title}}
          </template>
        </Column>
        <Column field="parent_instance" header="Родительский экземпляр">
          <template #body="slotProps">
            <template v-if="slotProps.data.parent_instance.id === slotProps.data._id">
              <Tag severity="warn" value="Родитель"></Tag>
            </template>
            <template v-else>
              {{ slotProps.data.parent_instance.title }}
            </template>
          </template>
        </Column>
        <Column field="previous_instance" header="Предыдущий экземпляр">
          <template #body="slotProps">
            <template v-if="slotProps.data.previous_instance">
              {{ slotProps.data.previous_instance.title }}
            </template>
            <template v-else>
              <Tag severity="warn" value="Родитель"></Tag>
            </template>
          </template>
        </Column>
        <Column>
          <template #header>
            <div class="text-right">Actions</div>
          </template>
          <template #body="slotProps">
            <div class="flex justify-start">
              <Button icon="pi pi-trash"
                      outlined
                      severity="danger"
                      @click="confirmDeleteItem(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else class="p-4 text-center text-muted">
        <i class="pi pi-info-circle" style="font-size: 2rem;"></i>
        <p class="mt-2 mb-0">Нет данных для отображения</p>
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="dialogs.detailsDialog" :style="{ width: '800px' }"
          :dismissableMask="true"
          :modal="true"
          @hide="onHide"
          header="Детальная информация"
  >
    <DetailsDialog :data="generalStore.selectedEntity">
      <Button label="Редактирование"
              icon="pi pi-pencil"
              @click="addRelatedInstance()"
      />
    </DetailsDialog>
  </Dialog>

  <Dialog v-model:visible="dialogs.addItemDialog"
          header="Создание экземпляра" :style="{ width: '1200px' }" :modal="true">
    <AddComponent
      :formData="generalStore.selectedEntity"
      :mode="mode"
    />
  </Dialog>

  <DeleteDialog :deleteItem="deleteItem"/>
  <VersionInstDialog
    :data="generalStore.selectedEntity"
    v-if="dialogs.versionDialog"/>

  <Dialog v-model:visible="dialogs.addInstDialog"
          header="Создание экземпляра" :style="{ width: '1200px' }" :modal="true"
          @hide="clearAllData"
  >
    <Stepper value="1" linear>
      <StepList>
        <Step value="1">Выберите активную модель</Step>
        <Step value="2">Создайте экземляр</Step>
      </StepList>
      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1">
          <AutoComplete
            v-model="selectedActiveModel"
            :suggestions="filteredModels"
            optionLabel="title"
            @complete="filterActiveModel"
            dropdown
          />

          <div class="flex pt-6 justify-end">
            <Button label="Следующий шаг" :disabled="!selectedActiveModel" icon="pi pi-arrow-right" @click="() => {
             activateCallback('2')
              addInstance()
            }"/>
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="2">
          <AddComponent
            v-if="selectedActiveModel"
            :formData="selectedActiveModel"
            mode="instance"
          />
          <div class="flex pt-6 justify-between">
            <Button label="Назад" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Dialog>
  <Toast />
</template>