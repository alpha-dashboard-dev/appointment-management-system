export const API_CONFIG = {
    organization: {
        createOrganization: {
            endpoint: '/api/create_organization',
            method: 'POST',

            requestMapping: {
                title: 'org_title'
            },

            responseMapping: {
                org_title: 'title'
            },

            onSuccess(response) {
                console.log('Organization created', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },
        getAllOrganizations: {
            endpoint: '/organizations/get-all-organizations',
            method: 'GET'
        },

        updateOrganization: {
            endpoint: '/organizations/update-organization/:code',
            method: 'PUT'
        },

        deactivateOrganization: {
            endpoint: '/organizations/update-organization-status/:code',
            method: 'PATCH'
        },
    },
}