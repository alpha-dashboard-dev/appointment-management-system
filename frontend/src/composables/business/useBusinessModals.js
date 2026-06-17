// import { ref } from 'vue'
//
// export function useBusinessModals() {
//
//     const showEditModal = ref(false)
//     const showDeleteModal = ref(false)
//
//     const selected = ref(null)
//
//     const saving = ref(false)
//     const formError = ref('')
//
//     const editForm = ref({
//         name: '',
//         status: 'active'
//     })
//
//     function openEdit(business) {
//
//         selected.value = business
//
//         editForm.value = {
//             name: business.name,
//             status: business.status
//         }
//
//         formError.value = ''
//
//         showEditModal.value = true
//     }
//
//     function openDelete(business) {
//         selected.value = business
//         showDeleteModal.value = true
//     }
//
//     async function submitUpdate(
//         updateFn,
//         refreshFn
//     ) {
//
//         saving.value = true
//
//         try {
//
//             await updateFn(
//                 selected.value.business_code,
//                 editForm.value
//             )
//
//             showEditModal.value = false
//
//             await refreshFn()
//
//         } catch (err) {
//
//             formError.value =
//                 err.response?.data?.message ||
//                 'Update failed'
//
//         } finally {
//
//             saving.value = false
//         }
//     }
//
//     async function confirmDeactivate(
//         deactivateFn,
//         refreshFn
//     ) {
//
//         saving.value = true
//
//         try {
//
//             await deactivateFn(
//                 selected.value.business_code
//             )
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
//
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