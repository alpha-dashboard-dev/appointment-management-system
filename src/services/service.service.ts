import repo from "../repositories/service.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateService } from "../utils/validator";

class ServiceService {

    async create(data: any, actor: any) {
        const { name, businessCode, description, price, cost, currency, durationUom, durationValue, availability } = data;

        validateService(data);

        const serviceCode = generateCode();

        return await repo.create({
            businessCode,
            serviceCode,
            name: name.trim(),
            description: description || null,
            price: price || null,
            cost: cost || null,
            currency: currency || "USD",
            durationUom: durationUom || null,
            durationValue: durationValue || null,
            availability: availability || "onsite",
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getByCode(serviceCode: string) {
        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");
        return service;
    }

    async update(serviceCode: string, data: any, actor: any) {
        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");

        const allowed: any = {};
        if (data.name !== undefined) allowed.name = data.name;
        if (data.description !== undefined) allowed.description = data.description;
        if (data.price !== undefined) allowed.price = data.price;
        if (data.cost !== undefined) allowed.cost = data.cost;
        if (data.currency !== undefined) allowed.currency = data.currency;
        if (data.durationUom !== undefined) allowed.durationUom = data.durationUom;
        if (data.durationValue !== undefined) allowed.durationValue = data.durationValue;
        if (data.availability !== undefined) allowed.availability = data.availability;

        return await repo.update(serviceCode, allowed);
    }

    async delete(serviceCode: string, actor: any) {
        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");
        return await repo.delete(serviceCode);
    }
}

export default new ServiceService();
