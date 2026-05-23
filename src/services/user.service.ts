import repo from "../repositories/user.repository";
import { validateUser } from "../utils/validator";
import { hashPassword } from "../utils/hashPassword";
import { generateCode } from "../utils/codeGenerator";
import { ROLES } from "../utils/roles";

// user_types a business owner is allowed to create
const STAFF_USER_TYPES = [ROLES.OPERATIONAL_STAFF, ROLES.SERVICE_STAFF];

class UserService {

    async create(data: any, actor: any) {
        if (!actor) throw new Error("Unauthorized");

        if (actor.userType === ROLES.OPERATIONAL_STAFF) {
            // Operational staff can only create client accounts
            if (data.user_type !== ROLES.CLIENT) {
                throw new Error("Operational staff can only create client accounts");
            }
            data.business_code = actor.businessCode;
        } else if (actor.userType === ROLES.BUSINESS_OWNER) {
            // Business owners can only create operational_staff or service_staff
            if (!STAFF_USER_TYPES.includes(data.user_type)) {
                throw new Error(
                    `Business owner can only create users with user_type: ${STAFF_USER_TYPES.join(", ")}`
                );
            }
            data.business_code = actor.businessCode;
        } else if (actor.userType !== ROLES.ADMIN) {
            throw new Error("Insufficient permissions to create users");
        }

        validateUser(data);

        const existing = await repo.findByEmail(data.email);
        if (existing) throw new Error("Email is already registered");

        const user_code = generateCode();

        const hashedPassword = await hashPassword(data.password);

        const userData = {
            user_code,
            business_code: data.business_code || null,
            user_type: data.user_type,
            email: data.email.trim().toLowerCase(),
            password: hashedPassword,
            is_active: data.is_active,
            name: data.name || null,
            phone: data.phone || null,
        };

        return await repo.create(userData);
    }

    async getAll(filters: any = {}, actor: any) {
        // Non-admin actors can only see users from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }
        return await repo.findAll(filters);
    }

    async getByCode(userCode: string, actor?: any) {
        const user = await repo.findByCode(userCode);

        if (!user) throw new Error("User not found");

        // Non-admin actors can only view users from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const userBusinessCode = user.dataValues?.business_code ?? user.business_code;
            if (userBusinessCode !== actor.businessCode) {
                throw new Error("Access denied: user does not belong to your business");
            }
        }

        return user;
    }

    async update(userCode: string, data: any, actor: any) {
        const user = await repo.findByCode(userCode);

        if (!user) throw new Error("User not found");

        // Non-admin actors can only update users from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const userBusinessCode = user.dataValues?.business_code ?? user.business_code;
            if (userBusinessCode !== actor.businessCode) {
                throw new Error("Access denied: user does not belong to your business");
            }
            // Business owners cannot change user_type to admin or business_owner
            if (data.user_type && !STAFF_USER_TYPES.includes(data.user_type)) {
                throw new Error(
                    `Business owner can only set user_type to: ${STAFF_USER_TYPES.join(", ")}`
                );
            }
        }

        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        return await repo.update(userCode, data);
    }

    async delete(userCode: string, actor: any) {
        const user = await repo.findByCode(userCode);

        if (!user) throw new Error("User not found");

        // Non-admin actors can only deactivate users from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const userBusinessCode = user.dataValues?.business_code ?? user.business_code;
            if (userBusinessCode !== actor.businessCode) {
                throw new Error("Access denied: user does not belong to your business");
            }
        }

        return await repo.update(userCode, {
            is_active: "inactive",
        });
    }

    async changeStatus(userCode: string, status: string, actor: any) {
        if (!["active", "inactive"].includes(status)) {
            throw new Error("Invalid status");
        }

        const user = await repo.findByCode(userCode);
        if (!user) throw new Error("User not found");

        // Non-admin actors can only change status of users in their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const userBusinessCode = user.dataValues?.business_code ?? user.business_code;
            if (userBusinessCode !== actor.businessCode) {
                throw new Error("Access denied: user does not belong to your business");
            }
        }

        return await repo.update(userCode, {
            is_active: status,
        });
    }

    // Alias used by client controller
    async getByUserCode(userCode: string, actor?: any) {
        return this.getByCode(userCode, actor);
    }

    // async assignBusiness(userCode: string, businessCode: string, adminUser: any) {
    //     const user = await repo.findByCode(userCode);
    //
    //     if (!user) throw new Error("User not found");
    //
    //     return await repo.update(userCode, {
    //         business_code: businessCode,
    //     });
    // }
}

export default new UserService();