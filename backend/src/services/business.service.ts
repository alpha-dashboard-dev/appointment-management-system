import repo from "../repositories/business.repository";

import userRepo from "../repositories/user.repository";

import { generateCode } from "../utils/codeGenerator";

import { validateBusiness } from "../utils/validator";

import { hashPassword } from "../utils/hashPassword";

import initModels from "../config/database/sequelize/models/index";

const db = initModels();

class BusinessService {

    async create(data: any, actor?: any) {

        validateBusiness(data);

        const transaction =
            await db.sequelize.transaction();

        try {

            const businessCode =
                generateCode();

            const ownerCode =
                generateCode();

            const defaultPassword =
                await hashPassword(businessCode);

            const business = await repo.create(
                {
                    business_code:
                    businessCode,

                    organization_code:
                    data.organization_code,

                    name: data.name.trim(),

                    email: data.email || null,

                    phone: data.phone,

                    address: data.address || null,

                    timezone: data.timezone || null,

                    user_code: null,

                    status: "active",
                },
                { transaction }
            );

            const owner = await userRepo.create(
                {
                    user_code: ownerCode,

                    business_code: businessCode,

                    user_type: "business_owner",

                    name: data.name.trim(),

                    email: data.email || null,

                    phone: data.phone,

                    password: defaultPassword,

                    is_active: "active",
                },
                { transaction }
            );

            await repo.update(
                businessCode,
                {
                    user_code: ownerCode,
                },
                { transaction }
            );

            await transaction.commit();

            return {
                business,
                owner,
            };

        } catch (err) {

            await transaction.rollback();

            throw err;
        }
    }

    async findBusinessOrFail(
        businessCode: string,
        options: any = {}
    ) {

        const business =
            await repo.findByCode(
                businessCode,
                options
            );

        if (!business) {
            throw new Error(
                "Business not found"
            );
        }

        return business;
    }

    async getAll(query: any = {}) {

        const filters = {
            organization_code:
                query.organization_code,

            status: query.status,
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

    async getByCode(
        businessCode: string,
        query: any = {}
    ) {

        const options = {

            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],
        };

        return await this.findBusinessOrFail(
            businessCode,
            options
        );
    }

    async getByCodeWithOrganization(
        businessCode: string
    ) {

        return await this.findBusinessOrFail(
            businessCode,
            {
                include: ["organization"],
            }
        );
    }

    async getByBusinessCodeWithUser(
        businessCode: string
    ) {

        return await this.findBusinessOrFail(
            businessCode,
            {
                include: ["users"],
            }
        );
    }

    async update(
        businessCode: string,
        data: any,
        actor?: any
    ) {

        await this.findBusinessOrFail(
            businessCode
        );

        const allowed: any = {};

        const fields = [
            "name",
            "email",
            "phone",
            "address",
            "timezone",
            "status",
        ];

        for (const f of fields) {

            if (data[f] !== undefined) {

                allowed[f] = data[f];
            }
        }

        if (allowed.name) {
            allowed.name =
                allowed.name.trim();
        }

        return await repo.update(
            businessCode,
            allowed
        );
    }

    async changeStatus(
        businessCode: string,
        status: string
    ) {

        if (
            !["active", "inactive"]
                .includes(status)
        ) {

            throw new Error(
                "Invalid status"
            );
        }

        await this.findBusinessOrFail(
            businessCode
        );

        return await repo.update(
            businessCode,
            { status }
        );
    }

    async delete(
        businessCode: string,
        actor?: any
    ) {

        await this.findBusinessOrFail(
            businessCode
        );

        return await repo.delete(
            businessCode
        );
    }
}

export default new BusinessService();