import repo from "../repositories/organization.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateOrganization } from "../utils/validator";

class OrganizationService {

    async create(data: any) {
        const { name, status } = data;

        validateOrganization(data);

        const organizationCode = generateCode();

        return await repo.create({
            organization_code: organizationCode,
            name: name.trim(),
            status: status,
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getByCode(organizationCode: string) {
        const org = await repo.findByCode(organizationCode);
        if (!org) throw new Error("Organization not found");
        return org;
    }

    async update(organizationCode: string, data: any) {
        const org = await repo.findByCode(organizationCode);
        if (!org) throw new Error("Organization not found");

        const allowed: any = {};
        if (data.name) allowed.name = data.name.trim();
        if (data.status) allowed.status = data.status;

        return await repo.update(organizationCode, allowed);
    }

    async changeStatus(organizationCode: string, status: string) {
        if (!["active", "inactive"].includes(status)) {
            throw new Error("Status must be 'active' or 'inactive'");
        }
        const org = await repo.findByCode(organizationCode);
        if (!org) throw new Error("Organization not found");

        return await repo.update(organizationCode, { status });
    }
}

export default new OrganizationService();
