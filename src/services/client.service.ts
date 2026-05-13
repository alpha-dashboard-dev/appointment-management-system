import repo from "../repositories/client.repository";
import userRepo from "../repositories/user.repository";
import { validateClient } from "../utils/validator";

class ClientService {

    async create(data: any, actor: any) {
        const { business_code, user_code, name, email, phone, address } = data;

        validateClient(data);

        const existing = await repo.findByUserCode(user_code);
        if (existing) throw new Error("Client with this userCode already exists");

        return await repo.create({
            business_code,
            user_code,
            name: name.trim(),
            email: email || null,
            phone,
            address: address || null,
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getByUserCode(userCode: string) {
        const client = await repo.findByUserCode(userCode);
        if (!client) throw new Error("Client not found");
        return client;
    }

    async update(userCode: string, data: any, actor: any) {
        const client = await repo.findByUserCode(userCode);
        if (!client) throw new Error("Client not found");

        const allowed: any = {};
        const fields = ["name", "email", "phone", "address"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        return await repo.update(userCode, allowed);
    }

    async delete(userCode: string, actor: any) {
        const client = await repo.findByUserCode(userCode);
        if (!client) throw new Error("Client not found");
        return await repo.delete(userCode);
    }
}

export default new ClientService();