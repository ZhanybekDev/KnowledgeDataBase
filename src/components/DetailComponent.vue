<script setup lang="ts">
import { useGeneralStore } from '@/store/generalStore.ts'
import { useToast } from 'primevue/usetoast'

interface Props {
  selectedLanguage: string;
  fieldKey: string;
  field: any
}

const props = defineProps<Props>()

const toast = useToast()

const generalStore = useGeneralStore()

function hasValue(val: any) {
  if (val === null || val === undefined) return false

  if (typeof val === 'object') {
    return !!val.ru
  }

  return true
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-10">
      <h5 class="font-bold m-0">{{ fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1) }}</h5>

      <div>
        <span class="text-gray-600 mr-2">Type</span>
        <span>{{ field.type }}</span>
      </div>

      <div>
        <span class="text-gray-600 mr-2">Access</span>
        <template v-for="(access, index) in generalStore.filteredAccess(field.access)" :key="index">
          <Tag
            :value="access.role"
            class="mr-1"
          />
        </template>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div>
        <div class="flex">
          <div class="w-24 text-gray-600">Name</div>
          <div> {{ field.name[selectedLanguage] }}</div>
        </div>
      </div>

      <div v-if="hasValue(field.value)">
        <div class="flex">
          <div class="w-24 text-gray-600">Value</div>
          <div v-if="field.type === 'string'"> {{ field.value[selectedLanguage] }}</div>
          <div v-if="field.type === 'integer'">{{ field.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>