import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDialogStore = defineStore('dialogs', () => {
  const detailsDialog = ref(false)
  const openDetailsDialog = () => {
    detailsDialog.value = true
  }
  const closeDetailsDialog = () => {
    detailsDialog.value = false
  }

  const addItemDialog = ref(false)
  const openAddItemDialog = () => {
    addItemDialog.value = true
  }
  const closeAddItemDialog = () => {
    addItemDialog.value = false
  }

  const deleteDialog = ref(false)
  const openDeleteDialog = () => {
    deleteDialog.value = true
  }
  const closeDeleteDialog = () => {
    deleteDialog.value = false
  }

  const versionDialog = ref(false)
  const openVersionDialog = () => {
    versionDialog.value = true
  }
  const closeVersionDialog = () => {
    versionDialog.value = false
  }

  const addInstDialog = ref(false)
  const openAddInstDialog = () => {
    addInstDialog.value = true
  }
  const closeAddInstDialog = () => {
    addInstDialog.value = false
  }

  return {
    detailsDialog, openDetailsDialog, closeDetailsDialog,
    addItemDialog, openAddItemDialog, closeAddItemDialog,
    deleteDialog, openDeleteDialog, closeDeleteDialog,
    versionDialog, openVersionDialog, closeVersionDialog,
    addInstDialog, openAddInstDialog, closeAddInstDialog,
  }
})