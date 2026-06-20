import repo from "../repositories/user.repository";

import { validateUser } from "../utils/validator";

import { hashPassword } from "../utils/hashPassword";

import { generateCode } from "../utils/codeGenerator";

import { ROLES } from "../utils/roles";
import { buildWhere } from "../utils/buildWhere";

const STAFF_USER_TYPES = [ROLES.OPERATIONAL_STAFF, ROLES.SERVICE_STAFF, ROLES.CLIENT,];

class UserService {

    // ========================
    // 🔐 POLICY HELPERS
    // ========================

    isAdmin(actor: any) {
        return actor?.userType === ROLES.ADMIN;
    }

    isSameBusiness(actor: any, businessCode: string) {
        return actor?.businessCode === businessCode;
    }

    assertBusinessAccess(actor: any, businessCode: string) {

        if (this.isAdmin(actor)) return;

        if (!this.isSameBusiness(actor, businessCode)) {
            throw new Error(
                "Access denied: cross-business operation blocked"
            );
        }
    }

    normalizeActor(actor: any) {
        return {
            userType: actor.userType,
            businessCode: actor.businessCode,
            userCode: actor.user_code,
        };
    }

    // ========================
    // CREATE USER
    // ========================

    async create(data: any, actor: any) {

        if (!actor) throw new Error("Unauthorized");

        const a = this.normalizeActor(actor);

        // BUSINESS RULES
        if (a.userType === ROLES.OPERATIONAL_STAFF) {

            if (data.user_type !== ROLES.CLIENT) {
                throw new Error(
                    "Operational staff can only create clients"
                );
            }

            data.business_code = a.businessCode;
        }

        else if (a.userType === ROLES.BUSINESS_OWNER) {

            if (!STAFF_USER_TYPES.includes(data.user_type)) {
                throw new Error(
                    `Business owner can only create: ${STAFF_USER_TYPES.join(", ")}`
                );
            }

            data.business_code = a.businessCode;
        }

        else if (!this.isAdmin(a)) {

            throw new Error(
                "Insufficient permissions"
            );
        }

        validateUser(data);

        const exists =
            await repo.findByEmail(
                data.email
            );

        if (exists) {
            throw new Error(
                "Email already exists"
            );
        }

        const user_code = generateCode();

        const password = await hashPassword(
            data.password
        );

        return await repo.create({
            user_code,
            business_code:
                data.business_code,

            user_type: data.user_type,

            email:
                data.email.trim().toLowerCase(),

            password,

            name: data.name,

            phone: data.phone,

            employee_type:
                data.employee_type || null,

            is_active:
                data.is_active || "active",
        });
    }

    // ========================
    // GET ALL USERS
    // ========================

    async getAll(query: any = {}, actor: any) {
        // console.log(query.where)

        // console.log(query)

        const a = this.normalizeActor(actor);

        if (!this.isAdmin(a)) {
            query.business_code = a.businessCode;
        }
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

    async getByCode(userCode: string, actor: any, query: any = {}) {

        const user = await repo.findOne(
            {
                user_code: userCode
            },
            {
                include: query.include || []
            }
        );

        if (!user) {
            throw new Error("User not found");
        }

        this.assertBusinessAccess(
            actor,
            user.business_code
        );

        return user;
    }

    async getOne(where: any, actor: any, query: any = {}) {
        const user = await repo.findOne(
            where,
            {
                include: query.include || []
            }
        );

        if (!user) {
            throw new Error("User not found");
        }

        this.assertBusinessAccess(
            actor,
            user.business_code
        );

        return user;
    }

    // ========================
    // UPDATE USER
    // ========================

    async update(userCode: string, data: any, actor: any) {

        const user = await repo.findOne({
            user_code: userCode
        });

        if (!user) throw new Error("User not found");

        this.assertBusinessAccess(actor, user.business_code);

        if (actor.userType !== ROLES.ADMIN && data.user_type && !STAFF_USER_TYPES.includes(data.user_type)) {
            throw new Error(
                "Invalid role assignment"
            );
        }

        if (data.password) {
            data.password =
                await hashPassword(
                    data.password
                );
        }

        return await repo.update(
            { user_code: userCode },
            data
        );
    }

    // ========================
    // DELETE (Hard DELETE)
    // ========================

    async delete(userCode: string, actor: any) {
        const user =
            await repo.findOne({
                user_code: userCode
            });

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        this.assertBusinessAccess(
            actor,
            user.business_code
        );

        if (actor.userType !== ROLES.ADMIN) {
            throw new Error(
                "Only admin can permanently delete users"
            );
        }

        return await repo.delete({
            user_code: userCode
        });
    }

    // ========================
    // STATUS CHANGE
    // ========================

    async deactivate(userCode: string, data: any, actor: any) {

        const user = await repo.findOne({
            user_code: userCode
        });

        if (!user) {
            throw new Error("User not found");
        }

        this.assertBusinessAccess(
            actor,
            user.business_code
        );

        return await repo.deactivate({
            user_code: userCode
        },
            data
        );
    }

    async getByUserCode(userCode: string, actor: any) {

        return this.getByCode(userCode, actor);
    }
}

export default new UserService();