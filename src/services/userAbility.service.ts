// UserAbility service — manages fine-grained permission abilities per user.
import repo from "../repositories/userAbility.repository";
import { validateUserAbility } from "../utils/validator";

class UserAbilityService {

    async create(data: any, actor: any) {
        const { businessCode, userCode, userType, ability, addedBy } = data;

        validateUserAbility(data);

        return await repo.create({
            businessCode,
            userId: userCode,
            userType,
            ability: ability.trim(),
            status: data.status || "ACTIVE",
            addedBy: addedBy || actor?.userCode || null,
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
        allowed.updatedBy = actor?.userCode || null;

        return await repo.update(id, allowed);
    }

    async delete(id: number, actor: any) {
        const record = await repo.findById(id);
        if (!record) throw new Error("User ability not found");
        return await repo.delete(id);
    }
}

export default new UserAbilityService();
