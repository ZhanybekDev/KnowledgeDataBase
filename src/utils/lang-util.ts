export const availableLanguages = [
  { code: 'ru', name: 'Русский' },
  { code: 'ky', name: 'Кыргызский' },
  { code: 'en', name: 'Английский' },
  { code: 'uz', name: 'Узбекский' }
]

export const getLangName = (code: string): string => {
  const lang = availableLanguages.find(l => l.code === code)
  return lang ? lang.name : code
}