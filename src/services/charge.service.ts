// Charge service — manages reusable fee definitions (e.g. GST, platform fee) for a business.
import repo from "../repositories/charge.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateCharge } from "../utils/validator";

class ChargeService {

    async create(data: any, actor: any) {
        const { businessCode, chargeUom, chargeValue, name, description } = data;

        validateCharge(data);

        const chargeCode = generateCode();

        return await repo.create({
            businessCode,
            chargeCode,
            chargeUom,
            chargeValue,
            name: name.trim(),
            description: description || null,
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getByCode(chargeCode: string) {
        const charge = await repo.findByCode(chargeCode);
        if (!charge) throw new Error("Charge not found");
        return charge;
    }

    async update(chargeCode: string, data: any, actor: any) {
        const charge = await repo.findByCode(chargeCode);
        if (!charge) throw new Error("Charge not found");

        const allowed: any = {};
        if (data.chargeUom !== undefined) allowed.chargeUom = data.chargeUom;
        if (data.chargeValue !== undefined) allowed.chargeValue = data.chargeValue;
        if (data.name !== undefined) allowed.name = data.name;
        if (data.description !== undefined) allowed.description = data.description;

        return await repo.update(chargeCode, allowed);
    }

    async delete(chargeCode: string, actor: any) {
        const charge = await repo.findByCode(chargeCode);
        if (!charge) throw new Error("Charge not found");
        return await repo.delete(chargeCode);
    }
}

export default new ChargeService();
