import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.ts'
import { useToast } from 'primevue/usetoast'
import type { IInstance } from '@/types/model-interface.ts'

export const useInstancesStore = defineStore('instances', () => {
  const toast = useToast()
  const instances = ref<IInstance[]>([])

  const fetchAllInstances = async () => {
    try {
      const res = await api.get('/instances')
      instances.value = res.data
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: err, life: 3000 })
    }
  }

  return {
    instances, fetchAllInstances
  }
})