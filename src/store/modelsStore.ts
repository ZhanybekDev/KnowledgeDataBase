import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/api/axios.ts'
import { useToast } from 'primevue/usetoast'
import { initialModelData } from '@/utils/initial-data.ts'

export const useModelsStore = defineStore('models', () => {
  let initialData = ref<any>({ ...initialModelData })

  const clearInitialData = () => {
    initialData.value = { ...initialModelData }
  }

  const toast = useToast()
  const models = ref<any[]>([])

  const fetchAllModel = async () => {
    try {
      const res = await api.get('/models')
      models.value = res.data
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: err, life: 3000 })
    }
  }

  const modelsMap = computed(() => {
    const map = new Map()
    models.value.forEach(m => map.set(m._id, m))
    return map
  })

  const findModelById = (id: string | null) => {
    if (!id) return "Родитель"
    const found = modelsMap.value.get(id)
    return found?.title ?? "Неизвестный"
  }

  return {
    initialData, clearInitialData,
    models, fetchAllModel,
    findModelById
  }
})