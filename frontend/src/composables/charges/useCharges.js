// import { ref } from 'vue'
// import chargeService from '@/services/charges/charge.api.service'
//
// export function useCharge() {
//
//     const charges = ref([])
//     const loading = ref(false)
//     const error = ref('')
//
//     async function fetchCharges() {
//
//         loading.value = true
//         error.value = ''
//
//         try {
//             const res = await chargeService.getAll()
//
//             charges.value = (res.data.data || []).map(
//                 (charge) => ({
//                     ...charge,
//                     business_name: charge.business?.name || '',
//                 })
//             )
//
//         } catch (err) {
//
//             error.value = err.response?.data?.message ||
//                 'Failed to load Charges'
//
//         } finally {
//             loading.value = false
//         }
//     }
//
//     async function createCharge(data) {
//         return chargeService.create(data)
//     }
//
//
//     async function updateCharge(code, data) {
//         return chargeService.update(code, data)
//     }
//
//     async function deactivateCharge(code) {
//         return chargeService.deactivate(code)
//     }
//
//     return {
//         charges,
//         loading,
//         error,
//         fetchCharges,
//         createCharge,
//         updateCharge,
//         deactivateCharge
//     }
// }