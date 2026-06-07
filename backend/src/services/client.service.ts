import repo from "../repositories/client.repository";
import userRepo from "../repositories/user.repository";
import { validateClient } from "../utils/validator";
import { ROLES } from "../utils/roles";

class ClientService {

    async create(data: any, actor: any) {
        // Non-admin actors can only create clients for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

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

    async getAll(query: any = {}, actor?: any) {
        const filters: any = {
            business_code:
                query.business_code,
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
                ],
            ],
        };

        // Non-admin actors can only list clients from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }
        return await repo.findAll(
            filters,
            options
        );
    }

    async getByUserCode(
        userCode: string,
        actor?: any,
        query: any = {}
    ) {
        const options = {
            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],
        };

        const client = await repo.findByUserCode(
            userCode,
            options
        );
        if (!client) throw new Error("Client not found");

        // Non-admin actors can only view clients from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const clientBusiness = client.dataValues?.business_code ?? client.business_code;
            if (clientBusiness !== actor.businessCode) {
                throw new Error("Access denied: client does not belong to your business");
            }
        }

        return client;
    }

    async update(userCode: string, data: any, actor: any) {
        const client = await repo.findByUserCode(userCode);
        if (!client) throw new Error("Client not found");

        // Non-admin actors can only update clients from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const clientBusiness = client.dataValues?.business_code ?? client.business_code;
            if (clientBusiness !== actor.businessCode) {
                throw new Error("Access denied: client does not belong to your business");
            }
        }

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

        // Non-admin actors can only delete clients from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const clientBusiness = client.dataValues?.business_code ?? client.business_code;
            if (clientBusiness !== actor.businessCode) {
                throw new Error("Access denied: client does not belong to your business");
            }
        }

        return await repo.delete(userCode);
    }
}

export default new ClientService();