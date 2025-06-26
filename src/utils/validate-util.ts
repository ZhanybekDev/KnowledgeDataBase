export function validateFormData(data: Record<string, any>, mode: string): boolean {
  if (data.title.trim() === '') return false

  for (const key in data.data) {
    const item = data.data[key]

    if (typeof item.name !== 'object' || item.name === null) return false
    for (const lang in item.name) {
      if (!item.name[lang] || item.name[lang].toString().trim() === '') {
        return false
      }
    }

    if (mode === 'instance') {
      if (typeof item.value === 'object' && item.value !== null) {
        for (const lang in item.value) {
          if (item.value[lang] === null || item.value[lang] === '') {
            return false
          }
        }
      } else {
        if (item.value === null || item.value === '') {
          return false
        }
      }
    }

    if (!item.type || item.type.toString().trim() === '') {
      return false
    }

    if (!Array.isArray(item.access) || item.access.length === 0) {
      return false
    }
  }

  return true
}