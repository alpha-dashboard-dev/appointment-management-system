import { Op } from "sequelize";

export const FILTER_CONFIG: any = {

    business_code: {
        field: "business_code",
        op: Op.eq
    },

    userType: {
        field: "user_type",
        op: Op.eq
    },

    isActive: {
        field: "is_active",
        op: Op.eq
    },
    search: {
        type: "or",
        fields: [
            { field: "name", op: Op.like },
            { field: "email", op: Op.like },
            { field: "phone", op: Op.like },
            { field: "street", op: Op.like }
        ]
    },

    id: {
        field: "id",
        op: Op.eq
    }
};


// export const FILTER_CONFIG = {
//     User: {
//         business_code: {...},
//         user_type: {...}
//     },
//
//     Organization: {
//         is_active: {...}
//     }
// };