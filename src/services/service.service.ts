import repo from "../repositories/service.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateService } from "../utils/validator";

class ServiceService {

    async create(data: any, actor: any) {

        const { name, business_code, description, price, cost, currency, duration_uom, duration_value, availability } = data;
        // console.log(data);

        validateService(data);

        const serviceCode = generateCode();

        return await repo.create({
            business_code,
            service_code: serviceCode,
            name: name.trim(),
            description: description || null,
            price: price || null,
            cost: cost || null,
            currency: currency || "PKR",
            duration_uom: duration_uom || null,
            duration_value: duration_value || null,
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
        console.log(allowed)
        if (data.name !== undefined)
            allowed.name = data.name;
        if (data.description !== undefined)
            allowed.description = data.description;
        if (data.price !== undefined)
            allowed.price = data.price;
        if (data.cost !== undefined)
            allowed.cost = data.cost;
        if (data.currency !== undefined)
            allowed.currency = data.currency;
        if (data.duration_uom !== undefined)
            allowed.duration_uom = data.duration_uom;
        if (data.duration_value !== undefined)
            allowed.duration_value = data.duration_value;
        if (data.availability !== undefined)
            allowed.availability = data.availability;

        return await repo.update(serviceCode, allowed);
    }

    async delete(serviceCode: string, actor: any) {
        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");
        return await repo.delete(serviceCode);
    }
}
export default new ServiceService();
