// // CRUD business API Calls
//
// import { ref } from 'vue'
// import businessService from '@/services/business/business.api.service'
//
// export function useBusiness() {
//
//     const businesses = ref([])
//     const loading = ref(false)
//     const error = ref('')
//
//     async function fetchBusinesses() {
//
//         loading.value = true
//         error.value = ''
//
//         try {
//             const res = await businessService.getAll()
//
//             businesses.value = (res.data.data || []).map(
//                 (business) => ({
//                     ...business,
//                     organization_name:
//                         business.organization?.name || '',
//                 })
//             )
//
//         } catch (err) {
//
//             error.value = err.response?.data?.message ||
//                 'Failed to load Businesses'
//
//         } finally {
//             loading.value = false
//         }
//     }
//
//     async function createBusiness(data) {
//         return businessService.create(data)
//     }
//
//
//     async function updateBusiness(code, data) {
//         return businessService.update(code, data)
//     }
//
//     async function deactivateBusiness(code) {
//         return businessService.deactivate(code)
//     }
//
//     return {
//         businesses,
//         loading,
//         error,
//         fetchBusinesses,
//         createBusiness,
//         updateBusiness,
//         deactivateBusiness
//     }
// }