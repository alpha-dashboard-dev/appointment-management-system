// import {reactive, ref} from 'vue'
//
// export function useChargeModals() {
//
//     const showEditModal = ref(false)
//     const showDeleteModal = ref(false)
//
//     const selected = ref(null)
//
//     const saving = ref(false)
//     const formError = ref('')
//
//     const editForm = reactive({ name: '', status: 'active', charge_value: '', description: '', auto_apply: true })
//
//
//     function openEdit(charge) {
//         selected.value = charge
//         editForm.name = charge.name
//         editForm.charge_value = charge.charge_value
//         editForm.description = charge.description
//
//         formError.value = ''
//         showEditModal.value = true
//     }
//
//     function openDelete(charge) {
//         selected.value = charge
//         showDeleteModal.value = true
//     }
//
//     async function submitUpdate(updateFn, refreshFn) {
//
//         saving.value = true
//
//         try {
//
//             await updateFn(
//                 selected.value.charge_code,
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
//             await deactivateFn(selected.value.charge_code)
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