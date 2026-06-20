import repo from "../repositories/organization.repository";
import { buildWhere } from "../utils/buildWhere";

import { generateCode } from "../utils/codeGenerator";

import { validateOrganization } from "../utils/validator";
import { ROLES } from "../utils/roles";


class OrganizationService {

    async create(data: any, actor: any) {

        //  if (!actor && actor.userType !== "admin") throw new Error("Unauthorized");

        validateOrganization(data);

        const payload = {
            organization_code: generateCode(),

            name: data.name.trim(),

            status: data.status || "",
        };

        return await repo.createOrganization(payload);
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

    async getByOrganizationCode(organizationCode: string, query: any = {}) {


        const organization = await repo.findOne(
            {
                organization_code: organizationCode
            },
            {
                // inculde: query.include || []
                include: Array.isArray(query.include) ? query.include : [],

            }
        )

        if(!organization){
            throw new Error("Organization not Found")
        }

        return organization;
    }

    async update(organizationCode: string, data: any) 
    {
        const organization = await repo.findOne(
            {
                organization_code: organizationCode
            }
        );

        if(!organization){
            throw new Error("Organization Not found")
        }
        const payload: any = {};

        if (data.name) {
            payload.name = data.name.trim();
        }

        if (data.status) {
            payload.status = data.status;
        }

        return await repo.updateOrganization(
            { organization_code : organizationCode},
            payload
        );
    }

    async deactivateOrganization(organizationCode: any, data: any, actor: any){

        const organization = await repo.findOne({
            organization_code: organizationCode
        })

        if(!organization){
            throw new Error("Organization Not found")
        }

        return await repo.deactivateOrganization(
            {
                organization_code: organizationCode
            },
            data
        )
    }

    async delete(organizationCode: string, actor: any) {
            const organization =
                await repo.findOne({
                    organization_code: organizationCode
                });
    
            if (!organization) {
                throw new Error(
                    "Organization not found"
                );
            }
    
            if (actor.userType !== ROLES.ADMIN) {
                throw new Error(
                    "Only admin can permanently delete Organization"
                );
            }
    
            return await repo.deleteOrganization({
                organization_code: organizationCode
            });
        }
}

export default new OrganizationService();
