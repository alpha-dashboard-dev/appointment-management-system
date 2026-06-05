import repo from "../repositories/organization.repository";

import { generateCode } from "../utils/codeGenerator";

import { validateOrganization } from "../utils/validator";

class OrganizationService {

    async create(data: any) {

        validateOrganization(data);

        const payload = {
            organization_code: generateCode(),

            name: data.name.trim(),

            status:
                data.status || "active",
        };

        return await repo.create(payload);
    }

    async getAll(query: any = {}) {

        const filters = {
            status: query.status,
            search: query.search,
        };

        const options = {

            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],

            limit:
                query.limit
                    ? Number(query.limit)
                    : undefined,

            offset:
                query.offset
                    ? Number(query.offset)
                    : undefined,

            order: [
                [
                    query.sort_by || "created_at",

                    query.sort_order || "DESC",
                ]
            ],
        };

        return await repo.findAll(
            filters,
            options
        );
    }

    async findOrganizationOrFail(
        organizationCode: string,
        options: any = {}
    ) {

        const organization =
            await repo.findByCode(
                organizationCode,
                options
            );

        if (!organization) {
            throw new Error(
                "Organization not found"
            );
        }

        return organization;
    }

    async getByCode(
        organizationCode: string,
        query: any = {}
    ) {

        const options = {

            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],
        };

        return await this.findOrganizationOrFail(
            organizationCode,
            options
        );
    }

    async update(
        organizationCode: string,
        data: any
    ) {

        await this.findOrganizationOrFail(
            organizationCode
        );

        const payload: any = {};

        if (data.name) {
            payload.name =
                data.name.trim();
        }

        if (data.status) {
            payload.status =
                data.status;
        }

        return await repo.update(
            organizationCode,
            payload
        );
    }

    async changeStatus(
        organizationCode: string,
        status: string
    ) {

        if (
            !["active", "inactive"]
                .includes(status)
        ) {

            throw new Error(
                "Invalid organization status"
            );
        }

        await this.findOrganizationOrFail(
            organizationCode
        );

        return await repo.update(
            organizationCode,
            {
                status,
            }
        );
    }

    async delete(
        organizationCode: string
    ) {

        await this.findOrganizationOrFail(
            organizationCode
        );

        return await repo.delete(
            organizationCode
        );
    }
}

export default new OrganizationService();


// import repo from "../repositories/organization.repository";
// import { generateCode } from "../utils/codeGenerator";
// import { validateOrganization } from "../utils/validator";
//
// class OrganizationService {
//
//     async create(data: any) {
//         const { name, status } = data;
//
//         validateOrganization(data);
//
//         const organizationCode = generateCode();
//
//         return await repo.create({
//             organization_code: organizationCode,
//             name: name.trim(),
//             status: status,
//         });
//     }
//
//     async getAll(filters: any = {}) {
//         return await repo.findAll(filters);
//     }
//
//     async getByCode(organizationCode: string) {
//         const org = await repo.findByCode(organizationCode);
//         if (!org) throw new Error("Organization not found");
//         return org;
//     }
//
//     async update(organizationCode: string, data: any) {
//         const org = await repo.findByCode(organizationCode);
//         if (!org) throw new Error("Organization not found");
//
//         const allowed: any = {};
//         if (data.name) allowed.name = data.name.trim();
//         if (data.status) allowed.status = data.status;
//
//         return await repo.update(organizationCode, allowed);
//     }
//
//     async changeStatus(organizationCode: string, status: string) {
//         if (!["active", "inactive"].includes(status)) {
//             throw new Error("Status must be 'active' or 'inactive'");
//         }
//         const org = await repo.findByCode(organizationCode);
//         if (!org) throw new Error("Organization not found");
//
//         return await repo.update(organizationCode, { status });
//     }
// }
//
// export default new OrganizationService();
