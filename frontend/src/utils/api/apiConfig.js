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
            endpoint: '/organizations/deactivate-organization/:code',
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
        createClient: {
            endpoint: '/clients/create-client',
            method: 'POST',
        },
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

    service: {
        createService: {
            endpoint: '/services/create-service',
            method: 'POST',

            requestMapping: {
                title: 'service_title'
            },

            responseMapping: {
                service_title: 'title'
            },

            onSuccess(response) {
                console.log('Service created', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },
        getAllServices: {
            endpoint: '/services/get-all-services',
            method: 'GET'
        },

        updateService: {
            endpoint: '/services/update-service/:code',
            method: 'PUT'
        },

        deleteService: {
            endpoint: '/services/delete-service/:code',
            method: 'DELETE'
        },
        clientView: {
            endpoint: '/services/client-view',
            method: 'GET'
        }
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

    staffSchedule: {
        createSchedule: {
            endpoint: '/schedules/bulk-create-schedule',
            method: 'POST',
        },
        getAllSchedules: {
            endpoint: '/schedules/get-schedule',
            method: 'GET'
        },
        updateSchedule: {
            endpoint: '/schedules/update-schedule/:id',
            method: 'PUT',
        },
        deleteSchedule: {
            endpoint: '/schedules/delete-schedule/:id',
            method: 'DELETE',
        }

    },

    location: {
        createLocation: {
            endpoint: '/locations/create-location',
            method: 'POST',

            requestMapping: {
                title: 'location_title'
            },

            responseMapping: {
                location_title: 'title'
            },

            onSuccess(response) {
                console.log('Location created', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },
        getAllLocations: {
            endpoint: '/locations/get-all-locations',
            method: 'GET'
        },

        updateLocation: {
            endpoint: '/locations/update-location/:code',
            method: 'PUT'
        },

        deleteLocation: {
            endpoint: '/locations/delete-location/:code',
            method: 'DELETE'
        },
    },

    locationService: {
        createLocationService: {
            endpoint: '/location-services/create-location-service',
            method: 'POST',

            requestMapping: {
                title: 'loc_svc_title'
            },

            responseMapping: {
                loc_svc_title: 'title'
            },

            onSuccess(response) {
                console.log('Location Service created', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },
        getAllLocationServices: {
            endpoint: '/location-services/get-all-location-services',
            method: 'GET'
        },

        updateLocationService: {
            endpoint: '/location-services/update-location-service/:id',
            method: 'PATCH'
        },

        deleteLocationService: {
            endpoint: '/location-services/delete-location-service/:id',
            method: 'DELETE'
        },
    },

    appointment: {
        createAppointment: {
            endpoint: '/appointments/create-appointment',
            method: 'POST',
        },
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
        },
    },

    user: {
        createUser: {
            endpoint: '/users/create-user',
            method: 'POST',

            requestMapping: {
                title: 'user_title'
            },

            responseMapping: {
                user_title: 'title'
            },

            onSuccess(response) {
                console.log('User created', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },
        getAllUsers: {
            endpoint: '/users/get-all-users',
            method: 'GET'
        },

        updateUser: {
            endpoint: '/users/update-user/:code',
            method: 'PUT'
        },

        deactivateUser: {
            endpoint: '/users/update-user-status/:code',
            method: 'PATCH'
        },

    },

    invoice: {
        createInvoice: {
            endpoint: '/invoices',
            method: 'POST',

            requestMapping: {
                title: 'invoice_title'
            },

            responseMapping: {
                invoice_title: 'title'
            },

            onSuccess(response) {
                console.log('Invoice created', response)
            },

            onError(error) {
                console.error('Failed', error)
            }
        },
        getAllInvoices: {
            endpoint: '/invoices/get-invoice',
            method: 'GET'
        },

        // updateInvoice: {
        //     endpoint: '/invoices/:id',
        //     method: 'PUT'
        // },

        updateInvoice: {
            endpoint: '/invoices/update-invoice-status/:id',
            method: 'PATCH'
        },
    },

    authentication: {
        login: {
            endpoint: "/auth/login",
            method: "POST",
        },
        logout: {
            endpoint: "/auth/logout",
            method: "POST",
        }

    }
}