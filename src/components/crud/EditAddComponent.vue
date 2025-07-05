<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import api from '@/api/axios.ts'
import { useInstancesStore } from '@/store/instancesStore.ts'
import { getLangName } from '@/utils/lang-util.ts'
import { cloneDeep, isEqual } from 'lodash'
import { useModelsStore } from '@/store/modelsStore.ts'

interface Props {
  id: any;
  initialData: any
  isValid: boolean
}

const props = defineProps<Props>()
const toast = useToast()
const menu = ref()

const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const instancesStore = useInstancesStore()
const modelsStore = useModelsStore()

let startCopy = ref(null)

const isSame = computed(() => {
  return isEqual(startCopy.value, props.initialData)
})
const changedFields = ref<Record<string, any>>({})

function setChangedField(path: string, newValue: any, oldValue: any) {
  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    changedFields.value[path] = newValue
  } else {
    delete changedFields.value[path]
  }
}

const onUpdateNameValue = (key: string, lang: string, val: string, prop: any) => {
  const path = `data.${key}.name.${lang}`
  setChangedField(path, val, prop.name[lang])
  prop.name[lang] = val
}

const onUpdateTitle = (val: string) => {
  changedFields.value['title'] = val
}


const save = async () => {
  try {
    await api.put(`/models/edit?id=${props.id}`, changedFields.value);
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Данные успешно сохранились', life: 3000 })
    dialogs.closeAddItemDialog()
    dialogs.closeDetailsDialog()
    await instancesStore.fetchAllInstances()
    await modelsStore.fetchAllModel()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошикба', detail: err, life: 3000 })
  }
}

onMounted(() => {
  if(props.initialData.parent_model){
    startCopy.value = cloneDeep(props.initialData)
  }
})
</script>

<template>
  <div class="flex flex-col space-y-4 text-white p-4 rounded-lg">
    <div class="flex flex-col space-y-2">
      <label for="title" class="text-sm font-medium text-gray-300">Заголовок</label>
      <InputText id="title" v-model="initialData.title"
                 @update:modelValue="val => onUpdateTitle(val as string)"
                 class="w-full" />
    </div>

    <div class="flex flex-col space-y-2">
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

          <div class="mb-4">
            <div class="text-sm font-medium text-gray-300 mb-2">Имя свойства</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="lang in initialData.value_localization" :key="`name-${lang}`" class="flex flex-col">
                <label :for="`${key}-name-${lang}`" class="text-xs text-gray-400 mb-1">{{ getLangName(lang) }}</label>
                <InputText
                  :id="`${key}-name-${lang}`"
                  :modelValue="prop.name[lang]"
                  @update:modelValue="val => onUpdateNameValue(key, lang, val, prop)"
                  class="w-full"
                />
              </div>
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
      <Button label="Отмена" class="p-button-secondary" @click="dialogs.closeAddItemDialog()" />
      {{isSame}}
      <Button label="Сохранить" :disabled="Object.keys(initialData.data).length === 0 || !isValid || isSame" @click="save" />
    </div>
  </div>

  <pre>
  Changed: {{ changedFields }}
</pre>

  <hr>

  <pre>
    {{ initialData }}
  </pre>
</template>
