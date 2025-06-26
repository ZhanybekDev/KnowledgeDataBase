<script setup lang="ts">
import { onMounted } from 'vue'
import { useToast } from 'primevue/usetoast';
import { useGeneralStore } from '@/store/generalStore.ts'

const toast = useToast();
const generalStore = useGeneralStore()

onMounted(() => {
  generalStore.getAccessData();
});
</script>

<template>
  <div>
    <Toast />
    <div class="card">
      <h2 class="text-xl font-bold mb-4">Доступы</h2>
      <DataTable
        :value="generalStore.accesses"
        dataKey="_id"
        stripedRows
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <Column field="_id" header="ID" />
        <Column field="role" header="Название" />
      </DataTable>
    </div>
  </div>
</template>