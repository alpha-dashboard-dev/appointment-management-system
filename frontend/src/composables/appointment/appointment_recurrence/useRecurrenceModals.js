// import { ref } from 'vue'
//
// export function useRecurrenceModals(api) {
//
//     const showEditModal = ref(false)
//     const showDeleteModal = ref(false)
//     const selected = ref(null)
//
//     const saving = ref(false)
//     const formError = ref('')
//
//     const editForm = ref({
//         recurrence_uom: '',
//         recurrence_value: 1,
//         status: 'active',
//         auto_cancel_after_days: null,
//         reschedule_after_days: null
//     })
//
//     function openEdit(rec) {
//         selected.value = rec
//
//         editForm.value = {
//             recurrence_uom: rec.recurrence_uom,
//             recurrence_value: rec.recurrence_value,
//             status: rec.status,
//             auto_cancel_after_days: rec.auto_cancel_after_days,
//             reschedule_after_days: rec.reschedule_after_days
//         }
//
//         formError.value = ''
//         showEditModal.value = true
//     }
//
//     function openDelete(rec) {
//         selected.value = rec
//         showDeleteModal.value = true
//     }
//
//     async function submitUpdate(updateFn, refreshFn) {
//         saving.value = true
//         formError.value = ''
//
//         try {
//             await updateFn(selected.value.id, editForm.value)
//             showEditModal.value = false
//             await refreshFn()
//         } catch (err) {
//             formError.value = err.response?.data?.message || 'Update failed'
//         } finally {
//             saving.value = false
//         }
//     }
//
//     async function confirmDelete(deleteFn, refreshFn) {
//         saving.value = true
//
//         try {
//             await deleteFn(selected.value.id)
//             showDeleteModal.value = false
//             await refreshFn()
//         } catch (err) {
//             formError.value = err.response?.data?.message || 'Delete failed'
//         } finally {
//             saving.value = false
//         }
//     }
//
//     return {
//         showEditModal,
//         showDeleteModal,
//         selected,
//         saving,
//         formError,
//         editForm,
//         openEdit,
//         openDelete,
//         submitUpdate,
//         confirmDelete
//     }
// }