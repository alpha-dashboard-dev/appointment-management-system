import repo from "../repositories/business.repository";

import userRepo from "../repositories/user.repository";

import { generateCode } from "../utils/codeGenerator";

import { validateBusiness } from "../utils/validator";

import { hashPassword } from "../utils/hashPassword";

import initModels from "../config/database/sequelize/models/index";
import { buildWhere } from "../utils/buildWhere";
import { ROLES } from "../utils/roles";


const db = initModels();

class BusinessService {

    async create(data: any, actor?: any) {

        // console.log(data)

        validateBusiness(data);

        const transaction =
            await db.sequelize.transaction();

        try {

            const businessCode = generateCode();

            const ownerCode = generateCode();

            const defaultPassword = await hashPassword(businessCode);

            const business = await repo.create(
                {
                    business_code: businessCode,

                    organization_code: data.organization_code,

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
                    employee_type: null
                },
                { transaction }
            );

            await repo.update(
                {
                    business_code: businessCode
                },
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

    async getAll(query: any = {}, actor: any) {

        const where = buildWhere(query);

        return repo.findAll({
            where,
            include: Array.isArray(query.include)
                ? query.include
                : [],
            limit: query.limit ? Number(query.limit) : undefined,
            offset: query.offset ? Number(query.offset) : undefined,
            order: [
                [
                    query.sort_by || "created_at",
                    query.sort_order || "DESC"
                ]
            ]
        });
    }

    async getByCode(businessCode: string, query: any = {}, actor: any) {

        const business = await repo.findOne(
            {
                business_code: businessCode
            },
            {
                include: Array.isArray(query.include) ? query.include : [],

            }
        );

        if (!business) {
            throw new Error("Business not found");
        }

        return business;
    }

    async getOne(where: any, query: any = {}, actor: any) {

        const business = await repo.findOne(
            where,
            {
                include: Array.isArray(query.include) ? query.include : [],

            }
        );

        if (!business) {
            throw new Error("Business not found");
        }

        return business;
    }

    async update(businessCode: string, data: any, actor?: any) {

        const business = await repo.findOne(
            {
                business_code: businessCode
            }
        )

        if (!business) {
            throw new Error("Business not found")
        }

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
            allowed.name = allowed.name.trim();
        }

        return await repo.update(
            { business_code: businessCode },
            allowed
        );
    }

    // ========================
    // DELETE (Hard DELETE)
    // ========================

    async delete(businessCode: string, actor: any) {
        const business =
            await repo.findOne({
                business_code: businessCode
            });

        if (!business) {
            throw new Error(
                "Business not found"
            );
        }

        if (actor.userType !== ROLES.ADMIN) {
            throw new Error(
                "Only admin can permanently delete business"
            );
        }

        return await repo.delete({
            business_code: businessCode
        });
    }

    // ========================
    // STATUS CHANGE
    // ========================

    async deactivate(businessCode: string, data: any, actor: any) {

        const business = await repo.findOne({
            business_code: businessCode
        });

        if (!business) {
            throw new Error("Business not found");
        }

        return await repo.deactivate({
            business_code: businessCode
        },
            data
        );
    }
}

export default new BusinessService();