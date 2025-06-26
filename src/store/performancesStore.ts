import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios.ts'

export const usePerformanceStore = defineStore('performance', () => {
  const toast = useToast()
  const performances = ref([])

  const fetchAllPerformance = async () => {
    try {
      const res = await api.get('/performance')
      performances.value = [...res.data]
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить представления', life: 3000 })
    }
  }

  return {
    performances, fetchAllPerformance,
  }
})