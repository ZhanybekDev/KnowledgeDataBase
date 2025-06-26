<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios.ts'
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import { useModelsStore } from '@/store/modelsStore.ts'
import { availableLanguages, getLangName } from '@/utils/lang-util.ts'
import type { EntityModel } from '@/types/general-interface.ts'

interface Props {
  initialData?: EntityModel
  removeProperty: any
  isValid: boolean
}

const props = defineProps<Props>()
const toast = useToast()

const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const modelsStore = useModelsStore()

const save = async () => {
  generalStore.loading = true
  try {
    await api.post(`/models`, props.initialData);
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Данные успешно сохранились', life: 3000 })
    dialogs.closeAddItemDialog()
    dialogs.closeDetailsDialog()
    await modelsStore.fetchAllModel()
  } catch (err) {
    console.log("err", err)
    toast.add({ severity: 'error', summary: 'Внимание', detail: 'Не удалось создать модель', life: 3000 })
  }finally {
    generalStore.loading = false
  }
}
</script>

<template>
  <div class="flex flex-col space-y-4 text-white p-4 rounded-lg">
    <div class="flex flex-col space-y-2">
      <label for="title" class="text-sm font-medium text-gray-300">Заголовок</label>
      <InputText id="title" v-model="initialData.title" class="w-full" />
    </div>

    <div class="flex flex-col space-y-2">
      <label class="text-sm font-medium text-gray-300">Языки локализации</label>
      <div class="flex flex-wrap gap-3">
        <div v-for="lang in availableLanguages" :key="lang.code" class="flex items-center">
          <Checkbox
            :inputId="lang.code"
            v-model="initialData.value_localization"
            :value="lang.code"
            :disabled="lang.code === 'ru'"
          />
          <label :for="lang.code" class="ml-2 text-sm text-gray-300 cursor-pointer">{{ lang.name }}</label>
        </div>
      </div>
    </div>

    <div class="flex flex-col space-y-4">
      <div class="flex justify-end items-center">
        <slot></slot>
      </div>

      <div v-if="Object.keys(initialData.data).length > 0" class="space-y-6">
        <div v-for="(prop, key) in initialData.data" :key="key" class="border border-gray-700 rounded-lg p-4">
          <div class="flex justify-between mb-3">
            <div class="flex gap-10">
              <span class="font-medium text-gray-200">{{ key }}</span>
              <div>
                <span class="text-gray-600 mr-2">Type</span>
                <span>{{ prop.type }}</span>
              </div>
            </div>

            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-sm"
              @click="removeProperty(key)"
              :disabled="!isValid"
            />
          </div>

          <div class="mb-4">
            <div class="text-sm font-medium text-gray-300 mb-2">Имя свойства</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="lang in initialData.value_localization" :key="`name-${lang}`" class="flex flex-col">
                <label :for="`${key}-name-${lang}`" class="text-xs text-gray-400 mb-1">{{ getLangName(lang) }}</label>
                <InputText
                  :id="`${key}-name-${lang}`"
                  v-model="prop.name[lang]"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <div class="text-sm font-medium text-gray-300 mb-2">Права доступа</div>
            <MultiSelect
              v-model="prop.access"
              :options="generalStore.accesses"
              optionLabel="role"
              optionValue="_id"
              placeholder="Выберите права доступа"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-400">
        Нет свойств. Нажмите "Добавить свойство" для начала конструирования.
      </div>
    </div>

    <div class="flex justify-end space-x-3 mt-4">
      <Button label="Отмена" :disabled="generalStore.loading" class="p-button-secondary" @click="dialogs.closeAddItemDialog()" />
      <Button :disabled="!Object.keys(initialData.data).length || !isValid || generalStore.loading" @click="save" >
        Сохранить
        <template v-if="generalStore.loading">
          Сохранить <ProgressSpinner style="width: 15px; height: 15px" stroke-width="10" />
        </template>
      </Button>
    </div>
  </div>

  <pre>
    {{initialData}}
  </pre>
</template>
