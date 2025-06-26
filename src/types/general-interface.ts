export type ModeType = 'model' | 'instance' | 'edit' | 'relatedModel' | 'relatedInstance'

export type LangCode = 'ru' | 'ky' | 'en' | 'uz'

type PropertyType = 'string' | 'integer'

type LangMap<T> = Partial<Record<LangCode, T>>

type BaseProperty = {
  name: LangMap<string>
  type: PropertyType
  access: string[]
}

type StringProperty = BaseProperty & {
  type: 'string'
  value: LangMap<string | null>
}

type IntegerProperty = BaseProperty & {
  type: 'integer'
  value: number | null
}

type DataProperty = StringProperty | IntegerProperty

export type DataBlock = Record<string, DataProperty>

export interface EntityModel {
  parent_model: string | null
  parent_instance: string | null
  version: string
  publicised_date: string | null
  value_localization: LangCode[]
  removed: boolean
  is_active: boolean
  comment: string | null
  title: string,
  updatedAt: string | null,
  createdAt: string | null
  data: DataBlock
  _id: string | null
}