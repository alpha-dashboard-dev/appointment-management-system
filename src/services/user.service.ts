import repo from "../repositories/user.repository";
import { validateUser } from "../utils/validator";
import { hashPassword } from "../utils/hashPassword";
import { generateCode } from "../utils/codeGenerator";

class UserService {

    async create(data: any, User: any) {
        // console.log(data, User);
        if (!User || User.userType !== "ADMIN" && User.userType !== "BUSINESS_OWNER") {
            throw new Error("Only admin or business owner can create users");
        }

        validateUser(data);

        const existing = await repo.findByEmail(data.email);
        if (existing) throw new Error("Email is already registered");

        const user_code = generateCode();

        const hashedPassword = await hashPassword(data.password);

        const userData = {
            user_code,
            organization_code: data.organization_code,
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

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getByCode(userCode: string) {
        const user = await repo.findByCode(userCode);

        if (!user) throw new Error("User not found");

        return user;
    }

    async update(userCode: string, data: any, adminUser: any) {
        const user = await repo.findByCode(userCode);

        if (!user) throw new Error("User not found");

        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        return await repo.update(userCode, data);
    }

    async delete(userCode: string, adminUser: any) {
        const user = await repo.findByCode(userCode);

        if (!user) throw new Error("User not found");

        return await repo.update(userCode, {
            is_active: "inactive",
        });
    }

    async changeStatus(userCode: string, status: string, adminUser: any) {
        if (!["active", "inactive"].includes(status)) {
            throw new Error("Invalid status");
        }

        return await repo.update(userCode, {
            is_active: status,
        });
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