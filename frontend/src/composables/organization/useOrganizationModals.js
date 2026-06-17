// import { ref } from 'vue'
//
// export function useOrganizationModals() {
//
//     const showEditModal = ref(false)
//     const showDeleteModal = ref(false)
//
//     const selected = ref(null)
//
//     const saving = ref(false)
//     const formError = ref('')
//
//     const editForm = ref({name: '', status: 'active'})
//
//     function openEdit(org) {
//
//         selected.value = org
//
//         editForm.value = {name: org.name, status: org.status}
//
//         formError.value = ''
//
//         showEditModal.value = true
//     }
//
//     function openDelete(org) {
//         selected.value = org
//         showDeleteModal.value = true
//     }
//
//     async function submitUpdate(updateFn, refreshFn)
//     {
//         saving.value = true
//         formError.value = ''
//
//         try {
//
//             await updateFn(
//                 selected.value.organization_code,
//                 editForm.value
//             )
//
//             showEditModal.value = false
//
//             await refreshFn()
//
//         } catch (err) {
//
//             formError.value = err.response?.data?.message ||
//                 'Update failed'
//
//         } finally {
//             saving.value = false
//         }
//     }
//     async function confirmDeactivate(deactivateFn, refreshFn)
//     {
//
//         saving.value = true
//
//         try {
//
//             await deactivateFn(selected.value.organization_code)
//
//             showDeleteModal.value = false
//
//             await refreshFn()
//
//         } catch (err) {
//
//             formError.value =
//                 err.response?.data?.message ||
//                 'Deactivate failed'
//         } finally {
//
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
//         confirmDeactivate
//     }
// }