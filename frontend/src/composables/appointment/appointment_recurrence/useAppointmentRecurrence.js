// import { ref } from 'vue'
// import recurrenceService from '@/services/appointment/appointment_recurrence/appointment_recurrence.service'
//
// export function useAppointmentRecurrence() {
//
//     const recurrences = ref([])
//     const loading = ref(false)
//     const error = ref('')
//
//     async function fetchRecurrences(params = {}) {
//         loading.value = true
//         error.value = ''
//
//         try {
//             const res = await recurrenceService.getAll(params)
//
//             recurrences.value = (res.data.data || []).map((mapRecurrence) => ({
//                 ...mapRecurrence,
//                 business_name: mapRecurrence.business?.name
//             }))
//         } catch (err) {
//             error.value = err.response?.data?.message || 'Failed to load recurrences'
//         } finally {
//             loading.value = false
//         }
//     }
//
//     async function createRecurrence(data) {
//         return recurrenceService.create(data)
//     }
//
//     async function updateRecurrence(id, data) {
//         return recurrenceService.update(id, data)
//     }
//
//     async function deleteRecurrence(id) {
//         return recurrenceService.remove(id)
//     }
//
//     return {
//         recurrences,
//         loading,
//         error,
//         fetchRecurrences,
//         createRecurrence,
//         updateRecurrence,
//         deleteRecurrence
//     }
// }