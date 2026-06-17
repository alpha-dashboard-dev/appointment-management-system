// import { ref, computed } from 'vue'
// import api from '@/utils/api'
//
// export function useBusinessDetails() {
//
//     const loading = ref(false)
//     const business = ref(null)
//
//     const activeTab = ref('Services')
//
//     async function fetchBusiness(code) {
//
//         loading.value = true
//
//         try {
//             const res = await api.get(
//                 `/businesses/get-business/${code}`,
//                 {
//                     params: {
//                         include: 'organization,services,users,locations,appointments'
//                     }
//                 }
//             )
//
//             business.value = res.data.data || {}
//
//         } finally {
//             loading.value = false
//         }
//     }
//
//
//     //  derived data (NO extra API calls)
//     const organization = computed( () =>
//         business.value?.organization || []
//     )
//
//     const services = computed(() =>
//         business.value?.services || []
//     )
//
//     const staff = computed(() => {
//         const users = business.value?.users || []
//         return users.filter(
//             u =>
//                 u.user_type === 'operational_staff' ||
//                 u.user_type === 'service_staff'
//         )
//     })
//
//     const locations = computed(() =>
//         business.value?.locations || []
//     )
//
//     const appointments = computed(() =>
//         business.value?.appointments || []
//     )
//
//     return {
//         loading,
//         business,
//         activeTab,
//
//         fetchBusiness,
//         organization,
//         services,
//         staff,
//         locations,
//         appointments
//     }
// }