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
import DetailComponent from '@/components/DetailComponent.vue'
import { useModelsStore } from '@/store/modelsStore.ts'
import type { ModeType } from '@/types/general-interface.ts'

const toast = useToast()

const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const modelsStore = useModelsStore()

const model = ref(null);
const selectedLanguage = ref('ru');

// Получение
const selectedModel = ref(null)
const selectedModelForAdd = ref(null)

const mode = ref<ModeType>('model')

const dialogTitle = computed(() => {
  if(mode.value === 'model'){
    return 'Создание модели'
  }else if (mode.value === 'instance'){
    return 'Создание экземпляра'
  }else if(mode.value === 'edit'){
    return 'Редактирование'
  }else if(mode.value === 'relatedModel'){
    return 'Связать модель'
  }
})

// Добавление
const openAddModelDialog = () => {
  selectedModelForAdd.value = null
  model.value = null
  mode.value = 'model'
  dialogs.openAddItemDialog()
}

const addInstance = (itemModel: any) => {
  selectedModelForAdd.value = itemModel
  mode.value = 'instance'
  dialogs.openAddItemDialog()
}

const copyModel = (itemModel: any) => {
  itemModel = {
    ...itemModel,
    title: ''
  }
  delete itemModel._id
  selectedModelForAdd.value = itemModel
  mode.value = 'model'
  dialogs.openAddItemDialog()
}

const editModel = (itemModel: any) => {
  itemModel = {
    ...itemModel,
    parent_model: itemModel._id,
  }
  selectedModelForAdd.value = itemModel
  mode.value = 'edit'
  dialogs.openAddItemDialog()
}

const addRelatedModel = (itemModel: any) => {
  itemModel = {
    ...itemModel,
    parent_model: itemModel._id
  }
  selectedModelForAdd.value = itemModel
  mode.value = 'relatedModel'
  dialogs.openAddItemDialog()
}

// Удаление
const deleteItemDialog = ref(false);

const deleteItem = async (id: string) => {
  try {
    await api.put(`/models/remove?id=${id}`)
    model.value = null
    toast.add({ severity: 'success', summary: 'info', detail: 'Предмет был удален', life: 3000 });
    deleteItemDialog.value = false;
    await modelsStore.fetchAllModel()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: err, life: 3000 })
  }
}

function confirmDeleteItem(item) {
  model.value = item;
  deleteItemDialog.value = true;
}

onMounted(async () => {
  await modelsStore.fetchAllModel()
  await generalStore.getAccessData()
})

const openDetailsModal = (item) => {
  selectedModel.value = item.data
  dialogs.openDetailsDialog()
}
</script>

<template>
  <Toast />
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold mb-4">Модели</h2>
        <Button label="Добавить" @click="openAddModelDialog" />
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
      <Column field="title" :sortable="true" header="title" />
      <Column field="value_localization">
        <template #header>
          <div class="text-right">value_localization</div>
        </template>
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <template v-for="tag in slotProps.data.value_localization">
              <Tag :value="tag" />
            </template>
          </div>
        </template>
      </Column>
      <Column field="version" :sortable="true" header="version">
        <template #header>
          <div class="text-right">version</div>
        </template>
        <template #body="slotProps">
          <Button outlined rounded
                  :label="slotProps.data.version"
                  severity="info"
                  @click=""
          />
        </template>
      </Column>
      <Column field="parent_model" header="parent_model"/>
      <Column field="publicised_date" :sortable="true" header="publicised_date" />
      <Column>
        <template #header>
          <div class="text-right">Actions</div>
        </template>
        <template #body="slotProps">
          <div class="flex justify-start">
            <Button icon="pi pi-trash"
                    outlined rounded
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

  <Dialog v-model:visible="dialogs.detailsDialog" :style="{ width: '800px' }" :modal="true">
    <template #header class="justify-end">
      <h2 class="text-xl font-semibold m-0 text-center">ID: {{ selectedModel._id }}</h2>
      <div class="flex gap-2 self-center">
        <Button label="Родительская модель"
                severity="info"
                icon="pi pi-sitemap"
                size="small" />
      </div>
    </template>

    <div>
      <div class="flex justify-end">
        <div class="flex gap-2">
          <Select v-if="selectedModel.value_localization.length > 1" v-model="selectedLanguage" :options="selectedModel.value_localization"/>
          <Button label="Связанная модель"
                  icon="pi pi-plus"
                  @click="addRelatedModel(selectedModel)"
          />
          <Button label="Создать сущность"
                  icon="pi pi-plus"
                  @click="addInstance(selectedModel)"
          />
          <Button label="Скопировать поля"
                  severity="secondary"
                  icon="pi pi-copy"
                  @click="copyModel(selectedModel)"
          />
          <Button severity="secondary"
                  label="Редактировать"
                  icon="pi pi-pencil"
                  @click="editModel(selectedModel)"
          />
        </div>
      </div>
      <DetailComponent
        :data="selectedModel.data"
        :selectedLanguage="selectedLanguage"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="dialogs.addItemDialog"
          :header="dialogTitle" :style="{ width: '1200px' }" :modal="true">
    <AddComponent
      :data="selectedModelForAdd"
      :mode="mode"
    />
  </Dialog>

  <Dialog v-model:visible="deleteItemDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="model">Вы уверены, что хотите удалить "<b>{{ model.title }}</b>"?</span>
    </div>
    <template #footer>
      <Button label="Нет" icon="pi pi-times" text @click="deleteItemDialog = false" />
      <Button label="Да" icon="pi pi-check" @click="deleteItem(model._id)" />
    </template>
  </Dialog>
</template>