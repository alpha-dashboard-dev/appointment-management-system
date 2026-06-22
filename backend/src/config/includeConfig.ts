export const INCLUDE_CONFIG = {
    User: {
        business: {
            attributes: ["name"]
        }
    },

    Organization: {
        businesses: {
            attributes: ["name"]
        }
    },

    Business: {
        organization: {
            attributes: ["name"]
        },
        owner: {
            attributes: ["name"]
        },
        services: {
            attributes: ["name", "description", "price", "status"]
        },
        locations: {
            attributes: ["address", "street", "city", "country", "location_type", "status" ]
        }

    },
    Service: {
        business: {
            attributes: ["name"]
        }
    },

    Location: {
        business: {
            attributes: ["name"]
        }
    },

    LocationService: {
        business: {
            attributes: ["name"]
        },
        location: {
            attributes: ["address"]
        },
        service: {
            attributes: ["name"]
        }
    },

    Invoice: {
        business: {
            attributes: ["name"]
        },
        updatedByUser: {
            attributes: ["name"]
        }
    }



};