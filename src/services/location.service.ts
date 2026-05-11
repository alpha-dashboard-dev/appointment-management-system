// Location service — manages physical or virtual locations linked to a business.
import repo from "../repositories/location.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateLocation } from "../utils/validator";

class LocationService {

    async create(data: any, actor: any) {
        const { businessCode, locationType, address, street, apartment, city, postalCode, province, country } = data;

        validateLocation(data);

        const locationCode = generateCode();

        return await repo.create({
            businessCode: businessCode || null,
            locationCode,
            locationType,
            address: address || null,
            street: street || null,
            apartment: apartment || null,
            city: city || null,
            postalCode: postalCode || null,
            province: province || null,
            country: country || null,
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getByCode(locationCode: string) {
        const loc = await repo.findByCode(locationCode);
        if (!loc) throw new Error("Location not found");
        return loc;
    }

    async update(locationCode: string, data: any, actor: any) {
        const loc = await repo.findByCode(locationCode);
        if (!loc) throw new Error("Location not found");

        const allowed: any = {};
        const fields = ["locationType", "address", "street", "apartment", "city", "postalCode", "province", "country"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        return await repo.update(locationCode, allowed);
    }

    async delete(locationCode: string, actor: any) {
        const loc = await repo.findByCode(locationCode);
        if (!loc) throw new Error("Location not found");
        return await repo.delete(locationCode);
    }
}

export default new LocationService();
