import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRelateStore = defineStore('relate', () => {
    const startCopy = {}

  const allChildren = ref(null)
    return {
      startCopy,
      allChildren
    }
  }
)