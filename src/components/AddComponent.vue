<script setup lang="ts">
import ModelAddComponent from '@/components/crud/ModelAddComponent.vue'
import InstanceAddComponent from '@/components/crud/InstanceAddComponent.vue'
import EditAddComponent from '@/components/crud/EditAddComponent.vue'
import { computed, onMounted, reactive, type Ref, ref, watch } from 'vue'
import { useGeneralStore } from '@/store/generalStore.ts'
import TestModelComponent from '@/components/crud/TestModelComponent.vue'
import api from '@/api/axios.ts'
import RelatedInstanceComponent from '@/components/crud/RelatedInstanceComponent.vue'
import { validateFormData } from '@/utils/validate-util.ts'
import { getLangName } from '@/utils/lang-util.ts'
import { useToast } from 'primevue/usetoast'
import type { EntityModel, LangCode, ModeType } from '@/types/general-interface.ts'
import { useModelsStore } from '@/store/modelsStore.ts'

interface Props {
  mode: ModeType;
  formData: any | null;
}

const toast = useToast()
const props = defineProps<Props>()

const modelsStore = useModelsStore()
const generalStore = useGeneralStore()
const stringDialog = ref(false)
const numberDialog = ref(false)
const menu = ref()
const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}

const childInstances = ref<any[]>([])

const menuItems = [
  {
    label: 'Добавить строковое свойство',
    icon: 'pi pi-align-left',
    command: () => {
      openPropertyDialog('string')
    }
  },
  {
    label: 'Добавить числовое свойство',
    icon: 'pi pi-hashtag',
    command: () => openPropertyDialog('integer')
  }
]

const openPropertyDialog = (type: 'string' | 'integer') => {
  resetNewProperty()
  if(type === 'string'){
    stringDialog.value = true
  }else if(type === 'integer'){
    numberDialog.value = true
  }
}
const closePropertyDialog = (type: 'string' | 'integer') => {
  if(type === 'string'){
    stringDialog.value = false
  }else if(type === 'integer'){
    numberDialog.value = false
  }
}

const resetNewProperty = () => {
  newProperty.value = {
    key: '',
    names: props.formData.value_localization.reduce((acc: any, lang: string) => {
      acc[lang] = ''
      return acc
    }, {} as Record<string, string>),
    accesses: []
  }
}

const newProperty = ref({
  key: '',
  names: {} as Record<string, string>,
  accesses: [] as number[]
})

const removeProperty = (key: string) => {
  const { [key]: removed, ...rest } = props.formData.data
  props.formData.data = rest
}

const addProperty = (type: 'string' | 'integer') => {
  if (!newProperty.value.key) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Укажите ключ свойства', life: 3000 })
    return
  }

  if (props.formData.data[newProperty.value.key]) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Свойство с таким ключом уже существует', life: 3000 })
    return
  }

  const langs = props.formData.value_localization
  const name = Object.fromEntries(langs.map((lang: string) => [lang, newProperty.value.names[lang] || '']))
  const value = type === 'string'
    ? Object.fromEntries(langs.map((lang: string) => [lang, null]))
    : null

  props.formData.data[newProperty.value.key] = {
    name,
    value,
    type,
    access: newProperty.value.accesses
  }

  const dialogMap = {
    string: stringDialog,
    integer: numberDialog
  }
  dialogMap[type].value = false
}

const isValid = computed(() => {
  if(generalStore.loading){
    return false
  }else{
    return validateFormData(props.formData, props.mode)
  }
})

watch(() => props.formData.value_localization, (newLangs) => {
  for (const key in props.formData.data) {
    const prop = props.formData.data[key]

    const newName: Record<string, string> = {}

    newLangs.forEach((lang: string) => {
      newName[lang] = prop.name?.[lang] ?? ''
    })

    prop.name = newName

    if (prop.type === 'string') {
      const newValue: Record<string, string | null> = {}

      newLangs.forEach((lang: string) => {
        newValue[lang] = prop.value?.[lang] ?? null
      })

      prop.value = newValue
    }
  }
}, { deep: true })

onMounted(async () => {
  if(props.mode === 'relatedModel'){
    try {
      const res = await api.post(`/models/${props.formData._id}/instances`);
      childInstances.value = [...res.data]
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: "Не удалось получить экземляров", life: 3000 })
    }
  }
})
</script>

<template>
  <ModelAddComponent
    v-if="mode === 'model'"
    :initialData="props.formData"
    :isValid="isValid"
    :removeProperty="removeProperty"
  >
    <Button
      label="Добавить свойство"
      icon="pi pi-plus"
      @click="toggleMenu"
      :disabled="!isValid"
      class="p-button-sm"
    />
    <Menu ref="menu" :model="menuItems" :popup="true" />
  </ModelAddComponent>

  <InstanceAddComponent
    v-if="mode === 'instance'"
    :initialData="formData"
    :isValid="isValid"
  />

  <RelatedInstanceComponent
    v-if="mode === 'relatedInstance'"
    :initialData="formData"
    :isValid="isValid"
  >
    <slot></slot>
  </RelatedInstanceComponent>

  <EditAddComponent
    v-if="mode === 'edit' && formData.parent_model"
    :id="formData._id"
    :initialData="formData"
    :isValid="isValid"
  />

  <TestModelComponent
    v-if="mode === 'relatedModel' && formData.parent_model"
    :initialData="formData"
    :childInstances="childInstances"
    :isValid="isValid"
    :removeProperty="removeProperty"
  >
    <Button
      label="Добавить свойство"
      icon="pi pi-plus"
      @click="toggleMenu"
      :disabled="!isValid"
      class="p-button-sm"
    />
    <Menu ref="menu" :model="menuItems" :popup="true" />
  </TestModelComponent>

  <Dialog v-model:visible="stringDialog" header="Добавить строковое свойство" modal :style="{ width: '500px' }">
    <div class="flex flex-col space-y-4 p-3">
      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Ключ</label>
        <InputText id="stringKey"
                   v-model="newProperty.key" class="w-full" />
      </div>

      <div v-for="lang in formData.value_localization" :key="`new-name-${lang}`" class="flex flex-col">
        <label :for="`new-name-${lang}`" class="text-sm font-medium mb-1">Имя ({{ getLangName(lang) }})</label>
        <InputText :id="`new-name-${lang}`" v-model="newProperty.names[lang]" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Права доступа</label>
        <MultiSelect
          v-model="newProperty.accesses"
          :options="generalStore.accesses"
          optionLabel="role"
          optionValue="_id"
          placeholder="Выберите права доступа"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" @click="closePropertyDialog('string')" class="p-button-text" />
      <Button label="Добавить" @click="addProperty('string')" />
    </template>
  </Dialog>

  <Dialog v-model:visible="numberDialog" header="Добавить числовое свойство" modal :style="{ width: '500px' }">
    <div class="flex flex-col space-y-4 p-3">
      <div class="flex flex-col">
        <label for="numberKey" class="text-sm font-medium mb-1">Ключ</label>
        <InputText id="numberKey" v-model="newProperty.key" class="w-full" />
      </div>

      <div v-for="lang in formData.value_localization" :key="`new-name-${lang}`" class="flex flex-col">
        <label :for="`new-name-${lang}`" class="text-sm font-medium mb-1">Имя ({{ getLangName(lang) }})</label>
        <InputText :id="`new-name-${lang}`" v-model="newProperty.names[lang]" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Права доступа</label>
        <MultiSelect
          v-model="newProperty.accesses"
          :options="generalStore.accesses"
          optionLabel="role"
          optionValue="_id"
          placeholder="Выберите права доступа"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" @click="closePropertyDialog('integer')" class="p-button-text" />
      <Button label="Добавить" @click="addProperty('integer')" />
    </template>
  </Dialog>
</template>