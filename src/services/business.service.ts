import repo from "../repositories/business.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateBusiness } from "../utils/validator";

class BusinessService {

    async create(data: any) {
        const { organization_code, name, email, phone, address, timezone, user_code } = data;

        validateBusiness(data);

        const businessCode = generateCode();

        return await repo.create({
            business_code: businessCode,
            organization_code,
            name: name.trim(),
            email: email || null,
            phone,
            address: address || null,
            timezone: timezone || null,
            user_code: user_code || null,
        });
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
        const fields = ["name", "email", "phone", "address", "timezone", "userCode"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        return await repo.update(businessCode, allowed);
    }

    async assignUser(businessCode: string, userCode: string, adminUser: any) {
        const user = await repo.findByCode(businessCode);

        if (!user) throw new Error("Business not found");

        return await repo.update(businessCode, {
            user_code: userCode,
        });
    }

    async delete(businessCode: string) {
        const business = await repo.findByCode(businessCode);
        if (!business) throw new Error("Business not found");
        return await repo.delete(businessCode);
    }
}

export default new BusinessService();