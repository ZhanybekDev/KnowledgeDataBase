<script setup lang="ts">
import DetailComponent from '@/components/DetailComponent.vue'
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import { ref } from 'vue'
import { useModelsStore } from '@/store/modelsStore.ts'
import { useToast } from 'primevue/usetoast'

interface Props {
  data: any | null;
}

const toast = useToast()
const props = defineProps<Props>()

const selectedLanguage = ref('ru')
const generalStore = useGeneralStore()
const modelsStore = useModelsStore()
const dialogs = useDialogStore()

const onHide = () => {
  generalStore.clearSelectedEntity()
  modelsStore.clearInitialData()
}
</script>

<template>
  <Dialog v-model:visible="dialogs.detailsDialog" :style="{ width: '800px' }"
          :dismissableMask="true"
          :modal="true"
          @hide="onHide"
          header="Детальная информация"
  >
    <div>
      <div class="flex justify-end">
        <div class="flex gap-2">
          <Select v-if="data && data.value_localization.length > 1"
                  v-model="selectedLanguage"
                  :options="data?.value_localization" />
          <slot></slot>
        </div>
      </div>
      <div class="flex flex-col space-y-10 rounded-lg pt-5">
        <template v-for="(field, key) in data.data" :key="key">
          <DetailComponent
            :field="field"
            :fieldKey="key"
            :selectedLanguage="selectedLanguage"
          />
          <hr>
        </template>
      </div>
      <div class="flex flex-col gap-2 mt-5">

        <div class="w-50 text-gray-600 flex gap-4">ID :
          <span class="text-white">
            {{ data._id }}
          </span>
        </div>

        <div class="w-50 text-gray-600 flex gap-4">Дата публикации:
          <span class="text-white">
                <template v-if="data.publicised_date">
                {{ data.publicised_date }}
              </template>
              <template v-else>
                null
              </template>
              </span>
        </div>

        <div class="w-50 text-gray-600 flex gap-4">Комментарий :
          <span class="text-white">
            <template v-if="data.comment">
            {{ data.comment }}
          </template>
          <template v-else>
            null
          </template>
          </span>
        </div>

        <div class="w-50 text-gray-600 flex gap-4">parent_model :
          <span class="text-white">
            <template v-if="data.parent_model">
            {{ data.parent_model.id }}
          </template>
          <template v-else>
            null
          </template>
          </span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>

</style>