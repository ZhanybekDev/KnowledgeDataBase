export type Language = 'ru' | 'ky' | 'en' | 'uz';

export interface Field {
  name: any;
  value: any;
  type: 'string' | 'integer';
  access: string[];
}

export interface IModel {
  _id: string | null;
  previous_model: string | null;
  parent_model: string | null;
  generation: number;
  publicised_date: string | null;
  value_localization: Language[];
  removed: boolean;
  is_active: boolean;
  comment: string | null;
  title: any;
  data: Record<string, Field>;
  updatedAt: string | null;
  createdAt: string | null;
}

export interface IInstance {
  _id: string | null;
  previous_instance: string | null;
  parent_instance: string | null;
  version: number;
  publicised_date: string | null;
  value_localization: Language[];
  removed: boolean;
  is_active: boolean;
  comment: string | null;
  title: any;
  data: Record<string, Field>;
  updatedAt: string | null;
  createdAt: string | null;
}
