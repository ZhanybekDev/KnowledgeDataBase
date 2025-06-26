<script setup lang="ts">
import { type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios.ts'
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import { useInstancesStore } from '@/store/instancesStore.ts'
import { getLangName } from '@/utils/lang-util.ts'

interface Props {
  initialData?: Ref<any>
  isValid: boolean
}

const props = defineProps<Props>()
const toast = useToast()

const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const instancesStore = useInstancesStore()

const save = async () => {
  try {
    await api.post(`/instances`, props.initialData);
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Данные успешно сохранились', life: 3000 })
    dialogs.closeAddItemDialog()
    dialogs.closeDetailsDialog()
    dialogs.closeAddInstDialog()
    await instancesStore.fetchAllInstances()
  } catch (err) {
    console.log("err", err)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: err, life: 3000 })
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
        <div v-for="lang in initialData.value_localization" :key="lang.code" class="flex items-center">
          <Chip :label="getLangName(lang)" />
        </div>
      </div>
    </div>

    <div class="flex flex-col space-y-4">
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
          </div>
          <div class="mb-4" >
            <div v-if="prop.type === 'string'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="lang in initialData.value_localization" :key="`value-${lang}`" class="flex flex-col">
                <label :for="`${key}-value-${lang}`" class="text-gray-400 mb-1">{{ prop.name[lang] }}</label>
                <InputText
                  :id="`${key}-value-${lang}`"
                  v-model="prop.value[lang]"
                  class="w-full"
                />
              </div>
            </div>

            <div v-else-if="prop.type === 'integer'" class="flex flex-col">
              <label :for="`${key}-value-ru`" class="text-gray-400 mb-1">{{ prop.name['ru'] }}</label>
              <InputNumber
                :id="`${key}-value-ru`"
                v-model="prop.value"
                class="w-full"
              />
            </div>
          </div>

          <div>
            <div class="text-sm font-medium text-gray-300 mb-2">Права доступа</div>
            <div class="flex items-center gap-1">
              <div v-for="access in generalStore.accesses" :key="access._id">
                <Chip :label="access.role" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-3 mt-4">
      <Button label="Отмена" v-if="!dialogs.addInstDialog" class="p-button-secondary" @click="dialogs.closeAddItemDialog()" />
      <Button label="Сохранить" :disabled="Object.keys(initialData.data).length === 0 || !isValid" @click="save" />
    </div>
  </div>

  <pre>
    {{initialData}}
  </pre>
</template>
