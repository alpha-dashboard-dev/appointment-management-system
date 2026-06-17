// import { ref, computed } from 'vue'
//
// export function useRecurrenceFilters(recurrences) {
//
//     const search = ref('')
//     const bizFilter = ref('')
//     const statusFilter = ref('')
//
//     const filteredRecurrences = computed(() => {
//         return recurrences.value.filter(r => {
//
//             const matchSearch =
//                 !search.value ||
//                 r.appointment_code?.toLowerCase().includes(search.value.toLowerCase())
//
//             const matchBiz = !bizFilter.value || r.business_code === bizFilter.value
//             const matchStatus = !statusFilter.value || r.status === statusFilter.value
//
//             return matchSearch && matchBiz && matchStatus
//         })
//     })
//
//     return {
//         search,
//         bizFilter,
//         statusFilter,
//         filteredRecurrences
//     }
// }