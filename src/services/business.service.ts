import repo from "../repositories/business.repository"
import userRepo from "../repositories/user.repository"
import { generateCode } from "../utils/codeGenerator";
import { validateBusiness } from "../utils/validator";
import {hashPassword} from "../utils/hashPassword";

class BusinessService {

    async create(data: any) {
        const { organization_code, name, email, phone, address, timezone } = data;
        // console.log(data)
        validateBusiness(data);

        /*
            create transactions
         */

        const businessCode = generateCode();

        const business = await repo.create({
            business_code: businessCode,
            organization_code,
            name: name.trim(),
            email: email || null,
            phone,
            address: address || null,
            timezone: timezone || null,
            user_code: null,
        });

        const ownerCode = generateCode();
        const defaultPassword = await hashPassword(businessCode);

        const owner = await userRepo.create({
            user_code: ownerCode,
            business_code: businessCode,
            user_type: "business_owner",
            name: name.trim(),
            email: email || null,
            phone,
            password: defaultPassword,
            is_active: "active",
        });

        await repo.update(businessCode, { user_code: ownerCode });

        return { business, owner };
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getByCode(businessCode: string) {
        const business = await repo.findByCode(businessCode);
        if (!business) throw new Error("Business not found");
        return business;
    }

    async update(businessCode: string, data: any) {
        const business = await repo.findByCode(businessCode);
        if (!business) throw new Error("Business not found");

        const allowed: any = {};
        const fields = ["name", "email", "phone", "address", "timezone", "user_code"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        return await repo.update(businessCode, allowed);
    }

    // async assignUser(businessCode: string, userCode: string, adminUser: any) {
    //     const user = await repo.findByCode(businessCode);
    //
    //     if (!user) throw new Error("Business not found");
    //
    //     return await repo.update(businessCode, {
    //         user_code: userCode,
    //     });
    // }
    async changeStatus(businessCode: string, status: string) {
        if (!["active", "inactive"].includes(status)) {
            throw new Error("Status must be 'active' or 'inactive'");
        }
        const business = await repo.findByCode(businessCode);
        if (!business) throw new Error("Business not found");

        return await repo.update(businessCode, { status });
    }

    async delete(businessCode: string) {
        const business = await repo.findByCode(businessCode);
        if (!business) throw new Error("Business not found");
        return await repo.delete(businessCode);
    }
}

export default new BusinessService();