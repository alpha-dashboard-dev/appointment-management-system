import repo from "../repositories/location.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateLocation } from "../utils/validator";

class LocationService {

    async create(data: any, actor: any) {
        const { business_code, location_type, address, street, apartment, city, postal_code, province, country } = data;
        // console.log(location_type);

        validateLocation(data);

        const locationCode = generateCode();

        return await repo.create({
            business_code: business_code || null,
            location_code: locationCode,
            location_type: location_type,
            address: address || null,
            street: street || null,
            apartment: apartment || null,
            city: city || null,
            postal_code: postal_code || null,
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
        const fields = ["location_type", "address", "street", "apartment", "city", "postal_code", "province", "country"];
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