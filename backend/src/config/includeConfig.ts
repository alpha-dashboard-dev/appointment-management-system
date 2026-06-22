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
    }



};