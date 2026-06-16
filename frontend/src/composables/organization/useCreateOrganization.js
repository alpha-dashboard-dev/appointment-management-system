import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { validateOrganizationForm } from '@/utils/validator'
import { useOrganization } from './useOrganization'

export function useCreateOrganization() {

    const router = useRouter()

    const {createOrganization} = useOrganization()

    const form = reactive({name: '',
        status: 'active'
    })

    const loading = ref(false)
    const error = ref('')
    const errors = reactive({})

    function validateField(field) {

        const validationErrors =
            validateOrganizationForm(form)

        if (validationErrors[field]) {
            errors[field] = validationErrors[field]
        } else {
            delete errors[field]
        }
    }

    async function submit() {

        const validationErrors =
            validateOrganizationForm(form)

        Object.keys(errors).forEach(
            key => delete errors[key]
        )

        Object.assign(errors, validationErrors)

        if (Object.keys(errors).length) return

        loading.value = true
        error.value = ''

        try {

            await createOrganization(form)

            router.push('/organizations')

        } catch (err) {

            error.value =
                err.response?.data?.message ||
                'Failed to create organization'

        } finally {

            loading.value = false
        }
    }

    return {
        form,
        loading,
        error,
        errors,
        validateField,
        submit
    }
}