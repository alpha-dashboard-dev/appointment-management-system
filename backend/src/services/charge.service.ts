import repo from "../repositories/charge.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateCharge } from "../utils/validator";
import { ROLES } from "../utils/roles";

class ChargeService {

    async create(data: any, actor: any) {
        // Non-admin actors can only create charges for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

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

    async getAll(filters: any = {}, actor?: any) {
        // Non-admin actors can only see charges from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }
        return await repo.findAll(filters);
    }

    async getByCode(chargeCode: string, actor?: any) {
        const charge = await repo.findByCode(chargeCode);
        if (!charge) throw new Error("Charge not found");

        // Non-admin actors can only view charges from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const chargeBusiness = charge.dataValues?.business_code ?? charge.business_code;
            if (chargeBusiness !== actor.businessCode) {
                throw new Error("Access denied: charge does not belong to your business");
            }
        }

        return charge;
    }

    async update(chargeCode: string, data: any, actor: any) {
        const charge = await repo.findByCode(chargeCode);
        if (!charge) throw new Error("Charge not found");

        // Non-admin actors can only update charges from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const chargeBusiness = charge.dataValues?.business_code ?? charge.business_code;
            if (chargeBusiness !== actor.businessCode) {
                throw new Error("Access denied: charge does not belong to your business");
            }
        }

        const allowed: any = {};
        if (data.charge_uom !== undefined)
            allowed.charge_uom = data.charge_uom;
        if (data.charge_value !== undefined)
            allowed.charge_value = data.charge_value;
        if (data.name !== undefined)
            allowed.name = data.name;
        if (data.description !== undefined)
            allowed.description = data.description;
        if (data.status !== undefined)
            allowed.status = data.status;

        return await repo.update(chargeCode, allowed);
    }

    async delete(chargeCode: string, actor: any) {
        const charge = await repo.findByCode(chargeCode);
        if (!charge) throw new Error("Charge not found");

        // Non-admin actors can only delete charges from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const chargeBusiness = charge.dataValues?.business_code ?? charge.business_code;
            if (chargeBusiness !== actor.businessCode) {
                throw new Error("Access denied: charge does not belong to your business");
            }
        }

        return await repo.delete(chargeCode);
    }
}

export default new ChargeService();
