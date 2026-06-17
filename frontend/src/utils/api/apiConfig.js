export const API_CONFIG = {
    organization: {
        createOrganization: {
            endpoint: '/organizations/create-organization',
            method: 'POST',

            requestMapping: {
                title: 'org_title'
            },

            responseMapping: {
                org_title: 'title'
            },

            successMessage: 'Organization created successfully',
            errorMessage: 'Failed to create organization',

            onSuccess(response) {
                console.log('Organization created message from API Config', response)
            },

            onError(error) {
                console.error('Failed to create organization message from API Config', error)
            }
        },
        getAllOrganizations: {
            endpoint: '/organizations/get-all-organizations',
            method: 'GET'
        },

        updateOrganization: {
            endpoint: '/organizations/update-organization/:code',
            method: 'PUT',

            requestMapping: {
                title: 'org_title'
            },

            responseMapping: {
                org_title: 'title'
            },

            onSuccess(response) {
                console.log('Organization Updated', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },

        deactivateOrganization: {
            endpoint: '/organizations/update-organization-status/:code',
            method: 'PATCH'
        },
    },

    business: {
        createBusiness: {
            endpoint: '/businesses/create-business',
            method: 'POST',

            requestMapping: {
                title: 'business_title'
            },

            responseMapping: {
                business_title: 'title'
            },

            successMessage: 'Business created successfully',
            errorMessage: 'Failed to create Business',

            onSuccess(response) {
                console.log('Business created message from API Config', response)
            },

            onError(error) {
                console.error('Failed to create Business message from API Config', error)
            }
        },

        getAllBusinesses: {
            endpoint: '/businesses/get-all-businesses',
            method: 'GET'
        },
        getOneBusiness: {
            endpoint: '/businesses/get-one-business/:code',
            method: 'GET'
        },

        updateBusiness: {
            endpoint: '/businesses/update-business/:code',
            method: 'PUT',

            requestMapping: {
                title: 'business_title'
            },

            responseMapping: {
                business_title: 'title'
            },

            onSuccess(response) {
                console.log('Business Updated', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },

        deactivateBusiness: {
            endpoint: '/businesses/update-business-status/:code',
            method: 'PATCH'
        },
    },

    client: {
        getAllClients: {
            endpoint: '/clients/get-client',
            method: 'GET'
        },
        updateClient: {
            endpoint: '/clients/update-client/:code',
            method: 'PUT',

            requestMapping: {
                title: 'client_title'
            },

            responseMapping: {
                client_title: 'title'
            },

            onSuccess(response) {
                console.log('Client Updated', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },
        deactivateClient: {
            endpoint: '/users/update-user-status/:code',
            method: 'PATCH'
        },
    },

    charge: {
        createBusinessCharge: {
            endpoint: '/charges/create-charge',
            method: 'POST',
        },

        getAllCharges: {
            endpoint: '/charges/get-all-charges',
            method: 'GET'
        },

        getOneCharge: {
            endpoint: '/charges/get-one-charge/:code',
            method: 'GET',
        },
        updateCharge: {
            endpoint: '/charges/update-charge/:code',
            method: 'PUT',
        },
        deactivateCharge: {
            endpoint: '/charges/deactivate-charge/:code',
            method: 'PATCH',
        },
        deleteCharge: {
            endpoint: '/charges/delete-charge/:code',
            method: 'DELETE',
        }

    },

    appointment: {
        getAllAppointments: {
            endpoint: '/appointments/get-all-appointments',
            method: 'GET'
        },

        getAppointmentHistory: {
            endpoint: '/appointments/get-appointment-history/:code',
            method: 'GET'
        },

        updateAppointmentStatus: {
            endpoint: '/appointments/update-appointment-status/:code',
            method: 'PATCH'
        },

        rescheduleAppointment: {
            endpoint: '/appointments/reschedule-appointment/:code',
            method: 'POST',
        },

        checkStaffAvailability: {
            endpoint: '/appointments/check-availability/:code',
            method: 'GET',
        },

        approveAppointment: {
            endpoint: '/appointments/approve-appointment/:code',
            method: 'POST',
        },

        createAppointmentRecurrence: {
            endpoint: '/appointments/create-appointment-recurrence',
            method: 'POST',
        },

        getAllAppointmentRecurrences: {
            endpoint: '/appointments/get-appointment-recurrence',
            method: 'GET'
        },
        updateAppointmentRecurrence: {
            endpoint: '/appointments/update-appointment-recurrence/:id',
            method: 'PUT',
        },
        deleteAppointmentRecurrence: {
            endpoint: '/appointments/delete-appointment-recurrence/:id',
            method: 'DELETE'
        }

    },


}