<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/api/axios.ts'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import type { EntityModel } from '@/types/general-interface.ts'
import { useGeneralStore } from '@/store/generalStore.ts'
import DeleteDialog from '@/components/DeleteDialog.vue'
import { useDialogStore } from '@/store/dialogStore.ts'
import { getToken } from '@/plugins/keycloak'

const dialogs = useDialogStore()
const toast = useToast()
const generalStore = useGeneralStore()
const users = ref([])
const changedFields = ref<Record<string, any>>({})

const addUserDialog = ref(false)
const openAddUserDialog = () => {
  addUserDialog.value = true
}
const closeAddUserDialog = () => {
  addUserDialog.value = false
}

const editUserDialog = ref(false)
const openEditUserDialog = (item) => {
  Object.assign(user.value, { ...item, role: item.role.id });
  editUserDialog.value = true
}
const closeEditUserDialog = () => {
  editUserDialog.value = false
}

const onUpdateValue = (key: string, val: string) => {
  changedFields.value[key] = val
}

const save = async () => {
  generalStore.loading = true
  try {
    await api.post(`/users`, user.value);
    closeAddUserDialog()
    await fetchAllUsers()
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Пользователь успешно добавился', life: 3000 })
    clearUser()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Внимание', detail: 'Не удалось добавить пользователя', life: 3000 })
  }finally {
    generalStore.loading = false
  }
}

const editUser = async () => {
  const { _id: id, ...data } = user.value
  try {
    await api.put(`/users/${id}`, data)
    closeEditUserDialog()
    await fetchAllUsers()
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Пользователь успешно отредактирован', life: 3000 })
    clearUser()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Внимание', detail: 'Не удалось отредактировать пользователя', life: 3000 })
  }
}

const user = ref({
  first_name: null,
  last_name: null,
  login: null,
  role: null,
  created_by: null,
  updated_by: null,
})

const clearUser = () => {
  user.value = {
    first_name: null,
    last_name: null,
    login: null,
    role: null,
    created_by: null,
    updated_by: null,
  }
}

const fetchAllUsers = async () => {
  const token = await getToken();
  console.log('token', token)
  try {
    const res = await api.get(`/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    users.value = res.data
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось получить пользователей', life: 3000 })
  }
}

function confirmDeleteItem(item: any) {
  generalStore.selectedEntity = item;
  dialogs.openDeleteDialog()
}

const deleteUser = async () => {
  try {
    const id = generalStore.selectedEntity?._id;
    await api.delete(`/users/${id}`);
    await fetchAllUsers()
    generalStore.clearSelectedEntity()
    dialogs.closeDeleteDialog()
    toast.add({ severity: 'success', detail: 'Пользователь успешно удален', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', detail: 'Не удалось удалить пользователя', life: 3000 })
  }
}

onMounted( () => {
  fetchAllUsers()
})
</script>

<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold mb-4">Пользавтели</h2>
        <Button label="Создать пользователя"
                icon="pi pi-plus"
                @click="openAddUserDialog"
        />
      </div>
    </template>
    <template #content>
      <DataTable
        v-if="users"
        :value="users"
        dataKey="_id"
        stripedRows
        responsiveLayout="scroll"
        size="small"
      >
        <Column field="firstName" :sortable="true" header="Имя"/>
        <Column field="lastName" :sortable="true" header="Фамилия"/>
        <Column field="login" :sortable="true" header="Логин"/>
        <Column field="role.role" :sortable="true" header="Роль"/>
        <Column :sortable="true" header="Действия">
          <template #body="slotProps">
            <div class="flex justify-start gap-1">
              <Button icon="pi pi-trash"
                      outlined
                      severity="danger"
                      @click="confirmDeleteItem(slotProps.data)" />

              <Button icon="pi pi-pencil"
                      outlined
                      severity="info"
                      @click="openEditUserDialog(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else class="p-4 text-center text-muted">
        <i class="pi pi-info-circle" style="font-size: 2rem;"></i>
        <p class="mt-2 mb-0">Нет данных для отображения</p>
      </div>
    </template>
  </Card>

  <DeleteDialog :deleteItem="deleteUser"/>


  <Dialog v-model:visible="addUserDialog" header="Добавление пользователя" modal :style="{ width: '500px' }">
    <div class="flex flex-col space-y-4 p-3">
      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Имя</label>
        <InputText id="stringKey" v-model="user.first_name" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Фамилия</label>
        <InputText id="stringKey" v-model="user.last_name" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Логин</label>
        <InputText id="stringKey" v-model="user.login" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Роль</label>
        <Select
          v-model="user.role"
          :options="generalStore.accesses"
          optionLabel="role"
          optionValue="_id"
          placeholder="Выберите роль"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" @click="closeAddUserDialog()" class="p-button-text" />
      <Button label="Добавить" @click="save()"/>
    </template>
  </Dialog>

  <Dialog v-model:visible="editUserDialog" header="Редактирование пользователя" modal :style="{ width: '500px' }">
    {{changedFields}}
    <div class="flex flex-col space-y-4 p-3">
      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Имя</label>
        <InputText id="stringKey"
                   @update:modelValue="val => onUpdateValue('first_name', val)"
                   v-model="user.first_name" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Фамилия</label>
        <InputText id="stringKey"
                   @update:modelValue="val => onUpdateValue('last_name', val)"
                   v-model="user.last_name" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Логин</label>
        <InputText id="stringKey"
                   @update:modelValue="val => onUpdateValue('login', val)"
                   v-model="user.login" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="stringKey" class="text-sm font-medium mb-1">Роль</label>
        <Select
          v-model="user.role"
          @update:modelValue="val => onUpdateValue('role', val)"
          :options="generalStore.accesses"
          optionLabel="role"
          optionValue="_id"
          placeholder="Выберите роль"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" @click="closeEditUserDialog()" class="p-button-text" />
      <Button label="Добавить" @click="editUser()"/>
    </template>
  </Dialog>
</template>

<style scoped>

</style>