<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDialogStore } from '@/store/dialogStore.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import { useRelateStore } from '@/store/relatedStore.ts'
import api from '@/api/axios.ts'
import { useModelsStore } from '@/store/modelsStore.ts'
import { cloneDeep, isEqual } from 'lodash'
import { validateFormData } from '@/utils/validate-util.ts'
import { availableLanguages, getLangName } from '@/utils/lang-util.ts'
import type { DataBlock, EntityModel, LangCode } from '@/types/general-interface.ts'
import Button from 'primevue/button'
import DetailsDialog from '@/components/DetailsDialog.vue'
import DetailComponent from '@/components/DetailComponent.vue'

interface Props {
  initialData: any
  childInstances: any
  removeProperty: any
  isValid: boolean
}

const props = defineProps<Props>()
const toast = useToast()

const localChildren = ref<any[]>([])

const dialogs = useDialogStore()
const generalStore = useGeneralStore()
const relatedStore = useRelateStore()
const modelsStore = useModelsStore()

const feedbackData = reactive({
  comment: null,
  generation: computed(() => generalStore.selectedEntity?.generation)
})

const clearFeedbackData = () => {
  feedbackData.comment = null
}

const allChildren = ref<any[]>([])
const currentStep = ref('1')

const showCheckingDialog = ref(false)
const showInformDialog = ref(false)
const showFeedbackDialog = ref(false)

const localDialog = ref(false)
const itemForDetailDialog = ref(null)
const selectedLanguage = ref('ru')

const openDetaildDialog = (item) => {
  itemForDetailDialog.value = item
  localDialog.value = true
}

const openInformDialog = () => {
  showInformDialog.value = true
}

const closeInformDialog = () => {
  showInformDialog.value = false
}

const makeReactiveGroups = (src: any[]) =>
  src.map(group => reactive(cloneDeep(group)))

const openCheckingDialog = () => {
  localChildren.value = makeReactiveGroups(props.childInstances)

  syncSchemaToModel(props.initialData, localChildren.value)

  localChildren.value.forEach((groupInst: any) => {
    const inst      = displayInst(groupInst)
    const missing: Record<string, string[] | true> = {}

    Object.entries(inst.data).forEach(([key, prop]: [string, any]) => {
      if (prop.type === 'string') {
        const langs = inst.value_localization.filter((lang: string) => prop.value[lang] == null)
        if (langs.length) missing[key] = langs
      }
      else if (prop.type === 'integer' && prop.value == null) {
        missing[key] = true
      }
    })

    groupInst.missingFields = missing
  })

  showCheckingDialog.value = true
}

const openFeedbackDialog = () => {
  closeInformDialog()
  showFeedbackDialog.value = true
}

const closeFeedbackDialog = () => {
  showFeedbackDialog.value = false
}

const handleSave = () => {
  if (props.childInstances.length === 0) {
    openFeedbackDialog()
  } else {
    openInformDialog()
  }
}

function hasSameKey (
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean {
  return walk(a, b)
  function walk (left: any, right: any, curKey?: string): boolean {
    if (curKey === 'access') {
      if (!Array.isArray(left) || !Array.isArray(right)) return false
      if (left.length !== right.length) return false
      // сравниваем как множества, порядок не важен
      const setL = new Set(left)
      return right.every((el: unknown) => setL.has(el))
    }

    if (Array.isArray(left) || Array.isArray(right)) {
      // валидация структуры: главное ─ сам факт, что это массив
      return Array.isArray(left) && Array.isArray(right)
    }

    if (isObject(left) && isObject(right)) {
      const keysL = Object.keys(left)
      const keysR = Object.keys(right)
      if (keysL.length !== keysR.length) return false

      // каждый ключ должен существовать и рекурсивно совпадать
      for (const key of keysL) {
        if (!Object.prototype.hasOwnProperty.call(right, key)) return false
        if (!walk(left[key], right[key], key)) return false
      }
      return true
    }

    // === 4. примитивы: значения не важны, структура «совпала» ===
    return true
  }
  function isObject (v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null
  }
}

const structureIsSame = computed(() =>
  relatedStore.startCopy
    ? hasSameKey(relatedStore.startCopy, props.initialData)
    : true
)

function syncSchemaToModel (
  model: typeof props.initialData,
  groups: any[]
) {
  const modelSchema = toRaw(model.data)

  // helper — пустой value для типа + языков
  const makeEmptyValue = (fieldType: string, langs: string[]) =>
    fieldType === 'string'
      ? Object.fromEntries(langs.map(l => [l, null]))
      : null

  groups.forEach(group => {
    Object.values(group.instances).forEach((inst: any) => {
      // ← вот сюда добавляем:
      inst.value_localization = [...model.value_localization]

      // теперь langs — точно из актуальной модели:
      const langs = inst.value_localization

      /* ---------- 1. удаляем лишние поля ---------- */
      for (const key in inst.data) {
        if (!(key in modelSchema)) {
          delete inst.data[key]
        }
      }

      /* ---------- 2. приводим к схеме модели ------ */
      for (const key in modelSchema) {
        const schemaField = modelSchema[key]

        /* 2.1 если поля нет — создаём с пустыми значениями по всем langs */
        if (!inst.data[key]) {
          inst.data[key] = reactive({
            ...cloneDeep(schemaField),
            value: makeEmptyValue(schemaField.type, langs)
          })
          continue
        }

        /* 2.2 если поле есть — синхронизируем meta и value */
        const instField = inst.data[key]
        instField.name   = cloneDeep(schemaField.name)
        instField.type   = schemaField.type
        instField.access = cloneDeep(schemaField.access)

        if (instField.type === 'string') {
          // если value не объект — создаём новый
          if (typeof instField.value !== 'object' || instField.value === null) {
            instField.value = reactive(makeEmptyValue('string', langs))
          } else {
            // ДОБАВЛЯЕМ все новые языки
            langs.forEach(l => {
              if (!(l in instField.value)) instField.value[l] = null
            })
            // и удаляем устаревшие
            for (const l in instField.value) {
              if (!langs.includes(l)) delete instField.value[l]
            }
          }
        } else {
          // для integer и др. типов — сбрасываем, если не примитив
          if (typeof instField.value === 'object') {
            instField.value = null
          }
        }
      }
    })
  })
}

function displayInst(groupInst: any) {
  return groupInst.instances[groupInst.show]
}

const isNullInst = (inst: EntityModel) => {
  return computed(() => !validateFormData(inst, 'instance'))
}

const saveWithRelated = async () => {
  localChildren.value.map(item => {
    item.instances[item.show].parent_instance = null
    item.instances[item.show].parent_model = null
    item.instances[item.show].previous_instance = null
    item.instances[item.show].version = '1.0.0'
    item.instances[item.show].comment = null
    item.instances[item.show].is_active = true
    item.instances[item.show].is_last = true
    delete item.instances[item.show].updatedAt
    delete item.instances[item.show].createdAt
    allChildren.value.push(item.instances[item.show])
  })

  props.initialData.comment = feedbackData.comment
  props.initialData.generation = feedbackData.generation

  try {
    await api.post(`/models/change-relate`, {
      model: props.initialData,
      childInst: allChildren.value
    })

    await modelsStore.fetchAllModel()
    closeFeedbackDialog()
    dialogs.closeDetailsDialog()
    dialogs.closeAddItemDialog()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: err, life: 3000 })
  }
}

const saveWithoutRelated = async () => {
  props.initialData.comment = feedbackData.comment
  props.initialData.generation = feedbackData.generation
  try {
    await api.post(`/models/without-relate`, props.initialData)
    await modelsStore.fetchAllModel()
    dialogs.closeDetailsDialog()
    dialogs.closeAddItemDialog()
    closeFeedbackDialog()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: err, life: 3000 })
  }
}

onMounted(() => {
  relatedStore.startCopy = JSON.parse(JSON.stringify(props.initialData))
})
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
      <Button label="Отмена" class="p-button-secondary" @click="dialogs.closeAddItemDialog()" />
      <Button
        label="Сохранить"
        :disabled="Object.keys(initialData.data).length === 0 ||  !isValid || structureIsSame"
        @click="handleSave()"
      />
    </div>

    <pre>
      {{ initialData }}
    </pre>
  </div>

  <Dialog v-model:visible="showInformDialog" header="Внимание!" :dismissableMask="true" modal
          :style="{ width: '500px' }">
    <h4>Все экземпляры будут обновлены</h4>
    <p>Вам необходимо проверить все экземпляры, так как изменения будут применены ко всем экземплярам, которые
      наследуются от модели</p>

    <template #footer>
      <Button label="Отмена" @click="closeInformDialog" class="p-button-text" />
      <Button label="Продолжить" @click="openFeedbackDialog" />
    </template>
  </Dialog>

  <Dialog v-model:visible="showFeedbackDialog" header="Опишите изменения в модели" modal :style="{ width: '500px' }"
          @hide="clearFeedbackData"
  >
    <div class="flex flex-col gap-3">
      <div class="flex flex-col">
        <label class="text-xs text-gray-400 mb-1">Комментарий:</label>
        <Textarea v-model="feedbackData.comment" autoResize cols="30" />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" @click="closeFeedbackDialog" class="p-button-text" />
      <Button label="Продолжить" :disabled="!feedbackData.comment"
              @click="() => childInstances.length === 0 ? saveWithoutRelated() :  openCheckingDialog()" />
    </template>
  </Dialog>

  <Dialog v-model:visible="showCheckingDialog" header="Опишите изменения в экземпляре" modal
          :style="{ width: '1000px' }">
    <Stepper v-model="currentStep" value="1" class="no-animation" linear>
      <StepItem
        v-for="(groupInst, index) in localChildren"
        :key="groupInst.parent_instance"
        :value="String(index + 1)"
        class="w-full"
      >
        <Step class="flex items-center">
          <Select v-model="groupInst.show"
                  :options="Object.values(groupInst.instances)"
                  class="ml-3"
                  optionLabel="title"
                  option-value="_id"
          >
            <template #option="slotProps">
              <div class="flex gap-2">
                {{ slotProps.option.title }}
                <Tag v-if="slotProps.option.is_active" severity="success" value="Активный"></Tag>
                <Tag v-if="slotProps.option.is_last" severity="warn" value="Последний"></Tag>
              </div>
            </template>
          </Select>

          <Button class="ml-3" label="Детальная информация" size="small" @click="openDetaildDialog(displayInst(groupInst))" />
        </Step>

        <StepPanel v-slot="{ activateCallback }">
          <div class="space-y-6 mt-4">
            <template v-for="key in Object.keys(groupInst.missingFields)" :key="key">
              <div class="border border-gray-700 rounded-lg p-4">
                <!-- заголовок, тип — их можно брать из displayInst -->
                <div class="flex justify-between mb-3">
                  <div class="flex gap-10">
                    <span class="font-medium text-gray-200">{{ key }}</span>
                    <div>
                      <span class="text-gray-600 mr-2">Type:</span>
                      <span>{{ displayInst(groupInst).data[key].type }}</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <!-- строки -->
                  <div
                    v-if="displayInst(groupInst).data[key].type === 'string'"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div
                      v-for="lang in groupInst.missingFields[key]"
                      :key="lang"
                      class="flex flex-col"
                    >
                      <label :for="`${key}-value-${lang}`" class="text-gray-400 mb-1">
                        {{ displayInst(groupInst).data[key].name[lang] }} | {{ lang }}
                      </label>
                      <InputText
                        :id="`${key}-value-${lang}`"
                        v-model="displayInst(groupInst).data[key].value[lang]"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <!-- числа -->
                  <div
                    v-else-if="displayInst(groupInst).data[key].type === 'integer'"
                    class="flex flex-col"
                  >
                    <label :for="`${key}-value-ru`" class="text-gray-400 mb-1">
                      {{ displayInst(groupInst).data[key].name['ru'] }}
                    </label>
                    <InputNumber
                      :id="`${key}-value-ru`"
                      v-model="displayInst(groupInst).data[key].value"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="flex mt-4">
            <Button
              v-if="index !== 0"
              label="Назад"
              class="p-button-secondary"
              icon="pi pi-arrow-left"
              @click="activateCallback(String(index))"
            />
            <div class="flex-1"></div>

            <Button
              v-if="index < childInstances.length - 1"
              label="Вперёд"
              icon="pi pi-arrow-right"
              iconPos="right"
              class="self-end"
              :disabled="isNullInst(displayInst(groupInst)).value"
              @click="activateCallback(String(index + 2))"
            />

            <Button
              v-if="index === childInstances.length - 1"
              label="Сохранить"
              icon="pi pi-check"
              class="p-button-success ml-2"
              :disabled="isNullInst(displayInst(groupInst)).value"
              @click="saveWithRelated()"
            />
          </div>
        </StepPanel>
      </StepItem>
    </Stepper>
  </Dialog>

  <Dialog v-model:visible="localDialog" :style="{ width: '800px' }"
          :dismissableMask="true"
          :modal="true"
          @hide="itemForDetailDialog = null"
          header="Детальная информация"
  >
    <div>
      <div class="flex justify-end">
        <div class="flex gap-2">
          <Select v-if="itemForDetailDialog && itemForDetailDialog.value_localization.length > 1"
                  v-model="selectedLanguage"
                  :options="itemForDetailDialog?.value_localization" />
        </div>
      </div>
      <DetailComponent
        v-if="itemForDetailDialog"
        :data="itemForDetailDialog.data"
        :selectedLanguage="selectedLanguage"
      />
      <div class="flex flex-col gap-2 mt-5">

        <div class="w-50 text-gray-600 flex gap-4">ID :
          <span class="text-white">
            {{ itemForDetailDialog._id }}
          </span>
        </div>

        <div class="w-50 text-gray-600 flex gap-4">Дата публикации:
          <span class="text-white">
                <template v-if="itemForDetailDialog.publicised_date">
                {{ itemForDetailDialog.publicised_date }}
              </template>
              <template v-else>
                null
              </template>
              </span>
        </div>

        <div class="w-50 text-gray-600 flex gap-4">Комментарий :
          <span class="text-white">
            <template v-if="itemForDetailDialog.comment">
            {{ itemForDetailDialog.comment }}
          </template>
          <template v-else>
            null
          </template>
          </span>
        </div>

        <div class="w-50 text-gray-600 flex gap-4">parent_model :
          <span class="text-white">
            <template v-if="itemForDetailDialog.parent_model">
            {{ itemForDetailDialog.parent_model.id }}
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
.no-animation :deep(.p-stepper-panel),
.no-animation :deep(.p-stepper-content),
.no-animation :deep(.p-stepper-panels) {
  transition: none !important;
  animation: none !important;
  transform: none !important;
}

.no-animation :deep(.p-stepper-panel-content) {
  transition: none !important;
  animation: none !important;
}

/* Для всех возможных анимированных элементов */
.no-animation :deep(*) {
  transition-duration: 0s !important;
  animation-duration: 0s !important;
}
</style>