// import { reactive, ref, onMounted } from 'vue'
// import { useRouter } from 'vue-router'
// import { validateBusinessForm } from '@/utils/validator'
// import organizationService from '@/services/organization/organization.api.service'
//
// export function useCreateBusiness(createBusiness) {
//
//     const router = useRouter()
//
//     const form = reactive({
//         name: '',
//         email: '',
//         phone: '',
//         address: '',
//         timezone: '',
//         organization_code: '',
//         status: 'active'
//     })
//
//     const organizations = ref([])
//
//     const timezones = [
//         'Asia/Karachi',
//         'Asia/Dubai',
//         'Asia/Kolkata',
//         'Europe/London',
//         'America/New_York',
//         'UTC'
//     ]
//
//     const loading = ref(false)
//     const error = ref('')
//
//     const errors = reactive({})
//
//     function validateField(field) {
//
//         const result =
//             validateBusinessForm(form)
//
//         if (result[field]) {
//             errors[field] = result[field]
//         } else {
//             delete errors[field]
//         }
//     }
//
//     async function loadOrganizations() {
//
//         try {
//
//             const res =
//                 await organizationService.getAll()
//
//             organizations.value =
//                 res.data.data || []
//
//         } catch (err) {
//             console.error(err)
//         }
//     }
//
//     async function submit() {
//
//         const validationErrors =
//             validateBusinessForm(form)
//
//         Object.keys(errors).forEach(k => delete errors[k])
//
//         Object.assign(
//             errors,
//             validationErrors
//         )
//
//         if (Object.keys(errors).length) {
//             return
//         }
//
//         loading.value = true
//         error.value = ''
//
//         try {
//
//             await createBusiness(form)
//
//             router.push('/businesses')
//
//         } catch (err) {
//
//             error.value =
//                 err.response?.data?.message ||
//                 'Failed to create business'
//
//         } finally {
//
//             loading.value = false
//         }
//     }
//
//     onMounted(loadOrganizations)
//
//     return {
//         form,
//         organizations,
//         timezones,
//         loading,
//         error,
//         errors,
//         validateField,
//         submit
//     }
// }