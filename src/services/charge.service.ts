import repo from "../repositories/charge.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateCharge } from "../utils/validator";

class ChargeService {

    async create(data: any, actor: any) {
        const { business_code, charge_uom, charge_value, name, description } = data;

        validateCharge(data);

        const chargeCode = generateCode();

        return await repo.create({
            business_code,
            charge_code: chargeCode,
            charge_uom,
            charge_value,
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
        if (data.charge_uom !== undefined) allowed.charge_uom = data.charge_uom;
        if (data.charge_value !== undefined) allowed.charge_value = data.charge_value;
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
