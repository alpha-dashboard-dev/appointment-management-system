import repo from "../repositories/user.repository";
import { validateUser } from "../utils/validator";
import { hashPassword } from "../utils/hashPassword";
import {generateCode} from "../utils/codeGenerator";

class UserService {

    async create(data: any, adminUser: any) {
        if (!adminUser || adminUser.userType !== "ADMIN") {
            throw new Error("Only admin can create users");
        }

        validateUser(data);

        const existing = await repo.findByEmail(data.email);
        if (existing) throw new Error("Email is already registered");

        data.password = await hashPassword(data.password);
        data.is_active = "active";

        return await repo.create(data);
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

    async assignBusiness(userCode: string, businessCode: string, adminUser: any) {
        const user = await repo.findByCode(userCode);

        if (!user) throw new Error("User not found");

        return await repo.update(userCode, {
            business_code: businessCode,
        });
    }
}

export default new UserService();