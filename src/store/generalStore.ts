import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.ts'
import type { IAccess } from '@/types/access-interface.ts'
import type { EntityModel } from '@/types/general-interface.ts'
import { useToast } from 'primevue/usetoast'

export const useGeneralStore = defineStore('general', () => {
  const toast = useToast()
  const accesses = ref<IAccess[]>([])
  const filteredAccess = (access: string[]) => {
    return accesses.value.filter(role => access.includes(role._id));
  }
  const getAccessData = async () => {
    try {
      const res = await api.get('/access')
      accesses.value = res.data
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: "Не удалось получить доступы", life: 3000 })
    }
  }

  const selectedEntity = ref<EntityModel | null>(null)

  const clearSelectedEntity = () => {
    selectedEntity.value = null
  }

  const loading = ref(false)

  return {
    loading,
    accesses, filteredAccess, getAccessData,
    selectedEntity,clearSelectedEntity
  }
})