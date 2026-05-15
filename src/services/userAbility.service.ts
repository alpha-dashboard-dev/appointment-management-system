import repo from "../repositories/userAbility.repository";
import { validateUserAbility } from "../utils/validator";

class UserAbilityService {

    async create(data: any, actor: any) {
        const { business_code, user_code, user_type, ability, added_by } = data;

        validateUserAbility(data);

        console.log(actor)

        return await repo.create({
            business_code,
            user_code,
            user_type,
            ability: ability.trim(),
            status: data.status || "active",
            added_by: added_by || actor?.userCode || null,
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getById(id: number) {
        const record = await repo.findById(id);
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