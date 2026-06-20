import repo from "../repositories/organization.repository";
import { buildWhere } from "../utils/buildWhere";

import { generateCode } from "../utils/codeGenerator";

import { validateOrganization } from "../utils/validator";

class OrganizationService {

    async create(data: any, actor: any) {

        //  if (!actor && actor.userType !== "admin") throw new Error("Unauthorized");

        validateOrganization(data);

        const payload = {
            organization_code: generateCode(),

            name: data.name.trim(),

            status: data.status || "",
        };

        return await repo.create(payload);
    }

    async getAllOrganizations(query: any = {}, actor: any){

        const where = buildWhere(query);

        return repo.findAllOrganizations({
            where,
            include: Array.isArray(query.include) ? query.include : [],
            limit: query.limit ? Number(query.limit) : undefined,
            offset: query.offset ? Number(query.offset) : undefined,
            order: [
                [
                    query.sort_by || "created_at",
                    query.sort_order || "DESC",
                ]
            ]
        })

    }

    // async getAll(query: any = {}) {
    //
    //     const filters = {
    //         status: query.status,
    //         search: query.search,
    //     };
    //
    //     const options = {
    //
    //         include:
    //             query.include
    //                 ? String(query.include)
    //                     .split(",")
    //                 : [],
    //
    //         limit:
    //             query.limit
    //                 ? Number(query.limit)
    //                 : undefined,
    //
    //         offset:
    //             query.offset
    //                 ? Number(query.offset)
    //                 : undefined,
    //
    //         order: [
    //             [
    //                 query.sort_by || "created_at",
    //
    //                 query.sort_order || "DESC",
    //             ]
    //         ],
    //     };
    //
    //     return await repo.findAll(
    //         filters,
    //         options
    //     );
    // }

    // async getAll(query: any = {}) {
    //     // console.log(query, actor)

    //     return repo.findAll(query, {
    //         include: Array.isArray(query.include)
    //             ? query.include
    //             : [],
    //         limit: query.limit,
    //         // offset: query.offset,
    //         // order: [
    //         //     [
    //         //         query.sort_by || "created_at",
    //         //         query.sort_order || "DESC"
    //         //     ]
    //         // ]
    //     });
    // }

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
