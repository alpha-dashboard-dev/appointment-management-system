import repo from "../repositories/userAbility.repository";
import { validateUserAbility } from "../utils/validator";

class UserAbilityService {

    async create(data: any, actor: any) {
        const { business_code, user_code, user_type, ability, added_by } = data;

        validateUserAbility(data);

        return await repo.create({
            business_code,
            user_code,
            user_type,
            ability: ability.trim(),
            status: data.status || "active",
            added_by: added_by || actor?.userCode || null,
        });
    }

    async getAll(query: any = {}) {
        const filters = {
            business_code:
                query.business_code,

            user_code: query.user_code,

            status: query.status,
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

        return await repo.findAll(
            filters,
            options
        );
    }

    async getById(
        id: number,
        query: any = {}
    ) {
        const options = {
            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],
        };

        const record = await repo.findById(
            id,
            options
        );
        if (!record) throw new Error("User ability not found");
        return record;
    }

    async update(id: number, data: any, actor: any) {
        const record = await repo.findById(id);
        if (!record) throw new Error("User ability not found");

        const allowed: any = {};
        if (data.ability !== undefined) allowed.ability = data.ability;
        if (data.status !== undefined) allowed.status = data.status;
        allowed.updated_by = actor?.userCode;

        return await repo.update(id, allowed);
    }

    async delete(id: number, actor: any) {
        const record = await repo.findById(id);
        if (!record) throw new Error("User ability not found");
        return await repo.delete(id);
    }
}

export default new UserAbilityService();