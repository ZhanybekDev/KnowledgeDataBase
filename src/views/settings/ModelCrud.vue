<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios.js'
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import AddComponent from '@/components/AddComponent.vue'
import { useModelsStore } from '@/store/modelsStore.ts'
import DetailsDialog from '@/components/DetailsDialog.vue'
import DeleteDialog from '@/components/DeleteDialog.vue'
import type { EntityModel, ModeType } from '@/types/general-interface.ts'
import GenerationDialog from '@/components/GenerationDialog.vue'

const toast = useToast()
const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const modelsStore = useModelsStore()

const mode = ref<ModeType>('model')

const dialogTitle = computed(() => {
  if(mode.value === 'model'){
    return 'Создание модели'
  }else if (mode.value === 'instance'){
    return 'Создание экземпляра'
  }else if(mode.value === 'edit'){
    return 'Редактирование'
  }else if(mode.value === 'relatedModel'){
    return 'Создание нового поколения'
  }else {
    return "Создание"
  }
})

// Добавление
const openAddModelDialog = () => {
  generalStore.selectedEntity = {...modelsStore.initialData}
  mode.value = 'model'
  dialogs.openAddItemDialog()
}

const addInstance = () => {
  const { _id } = generalStore.selectedEntity
  generalStore.selectedEntity = {
    ...generalStore.selectedEntity,
    title: '',
    parent_model: _id,
    version: '1.0.0',
    previous_instance: null,
    parent_instance: null,
    is_active: true,
    is_last: true,
  }

  delete generalStore.selectedEntity.generation
  delete generalStore.selectedEntity.previous_model
  delete modelsStore.initialData.previous_model
  delete modelsStore.initialData.generation
  mode.value = 'instance'
  dialogs.openAddItemDialog()
}

const copyModel = () => {
  generalStore.selectedEntity = {
    ...generalStore.selectedEntity,
    title: '',
    parent_model: null,
    previous_model: null
  }
  mode.value = 'model'
  dialogs.openAddItemDialog()
}

const editModel = () => {
  const { parent_model, previous_model } = generalStore.selectedEntity

  generalStore.selectedEntity = {
    ...generalStore.selectedEntity,
    previous_model: previous_model?.id,
    parent_model: parent_model?.id,
  }

  mode.value = 'edit'
  dialogs.openAddItemDialog()
}

const addRelatedModel = () => {
  const { _id, generation, parent_model } = generalStore.selectedEntity

  generalStore.selectedEntity = {
    ...generalStore.selectedEntity,
    previous_model: _id,
    parent_model: parent_model.id,
    is_active: true,
    generation: generation + 1
  }
  mode.value = 'relatedModel'
  dialogs.openAddItemDialog()
}

// Удаление
function confirmDeleteItem(item: EntityModel) {
  generalStore.selectedEntity = item;
  dialogs.openDeleteDialog()
}

const deleteItem = async () => {
  try {
    await api.put(`/models/remove?id=${generalStore.selectedEntity?._id}`)
    await modelsStore.fetchAllModel()
    generalStore.clearSelectedEntity()
    dialogs.closeDeleteDialog()
    toast.add({ severity: 'success', detail: 'Успешно удалено', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось удалить', life: 3000 })
  }
}

const openDetailsModal = (item: any) => {
  generalStore.selectedEntity = item.data
  dialogs.openDetailsDialog()
}

const openVersionModal = (item: any) => {
  generalStore.selectedEntity = item
  dialogs.openVersionDialog()
}

onMounted(async () => {
  await modelsStore.fetchAllModel()
})
</script>

<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold mb-4">Модели</h2>
        <Button label="Создать модель"
                icon="pi pi-plus"
                @click="openAddModelDialog" />
      </div>
    </template>
    <template #content>
      <DataTable
        v-if="modelsStore.models?.length"
        :value="modelsStore.models"
        dataKey="_id"
        row-hover
        stripedRows
        responsiveLayout="scroll"
        size="small"
        @row-click="openDetailsModal"
      >
        <Column field="title" :sortable="true" header="Название"/>
        <Column field="value_localization" header="Языки">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <template v-for="tag in slotProps.data.value_localization">
                <Tag :value="tag.toUpperCase()" />
              </template>
            </div>
          </template>
        </Column>
        <Column field="generation" :sortable="true" header="Поколение">
          <template #body="slotProps">
            <Button outlined
                    :label="slotProps.data.generation?.toString()"
                    severity="info"
                    @click="openVersionModal(slotProps.data)"
            />
          </template>
        </Column>
        <Column :sortable="true" header="Метки">
          <template #body="slotProps">
            <Tag v-if="slotProps.data.is_active" severity="success" value="Активный"></Tag>
            <Tag v-if="!slotProps.data.is_active" severity="warn" value="Не активный"></Tag>
          </template>
        </Column>
        <Column field="parent_model" header="Родительская модель">
          <template #body="slotProps">
            <template v-if="slotProps.data.parent_model.id === slotProps.data._id">
              <Tag severity="warn" value="Родитель"></Tag>
            </template>
            <template v-else>
              {{ slotProps.data.parent_model.title }}
            </template>
          </template>
        </Column>
        <Column field="previous_model" header="Предыдущая модель">
          <template #body="slotProps">
            <template v-if="slotProps.data.previous_model">
              {{ slotProps.data.previous_model.title }}
            </template>
            <template v-else>
              <Tag severity="warn" value="Родитель"></Tag>
            </template>
          </template>
        </Column>
        <Column header="Действия">
          <template #body="slotProps">
            <div class="flex justify-start gap-1">
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

  <DetailsDialog :data="generalStore.selectedEntity">
    <Button label="Новое поколение"
            icon="pi pi-plus"
            @click="addRelatedModel()" />
    <Button label="Создать экзепляр"
            icon="pi pi-plus"
            @click="addInstance()" />
    <Button label="Скопировать поля"
            severity="secondary"
            icon="pi pi-copy"
            @click="copyModel()" />
    <Button severity="secondary"
            label="Редактировать"
            icon="pi pi-pencil"
            @click="editModel()" />
  </DetailsDialog>

  <Dialog v-model:visible="dialogs.addItemDialog"
          :header="dialogTitle +  ` | ${mode}`" :style="{ width: '1200px' }" :modal="true"
          :closeOnEscape="false"
          @hide="dialogs.closeDetailsDialog()"
  >
    <AddComponent
      :formData="generalStore.selectedEntity"
      :mode="mode"
    />
  </Dialog>

  <DeleteDialog :deleteItem="deleteItem"/>
  <GenerationDialog v-if="dialogs.versionDialog"/>
  <Toast />
</template>