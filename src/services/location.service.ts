import repo from "../repositories/location.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateLocation } from "../utils/validator";
import { ROLES } from "../utils/roles";

class LocationService {

    async create(data: any, actor: any) {
        // Non-admin actors can only create locations for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

        const { business_code, location_type, address, street, apartment, city, postal_code, province, country } = data;

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

    async getAll(filters: any = {}, actor?: any) {
        // Non-admin, non-client actors can only see locations from their own business
        if (actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT) {
            filters.business_code = actor.businessCode;
        }
        // Clients pass business_code as query param; don't override it
        return await repo.findAll(filters);
    }

    async getByCode(locationCode: string, actor?: any) {
        const loc = await repo.findByCode(locationCode);
        if (!loc) throw new Error("Location not found");

        // Non-admin actors can only view locations from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const locBusiness = loc.dataValues?.business_code ?? loc.business_code;
            if (locBusiness !== actor.businessCode) {
                throw new Error("Access denied: location does not belong to your business");
            }
        }

        return loc;
    }

    async update(locationCode: string, data: any, actor: any) {
        const loc = await repo.findByCode(locationCode);
        if (!loc) throw new Error("Location not found");

        // Non-admin actors can only update locations from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const locBusiness = loc.dataValues?.business_code ?? loc.business_code;
            if (locBusiness !== actor.businessCode) {
                throw new Error("Access denied: location does not belong to your business");
            }
        }

        const allowed: any = {};
        const fields = ["location_type", "address", "street", "apartment", "city", "postal_code", "province", "country", "status"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        return await repo.update(locationCode, allowed);
    }

    async delete(locationCode: string, actor: any) {
        const loc = await repo.findByCode(locationCode);
        if (!loc) throw new Error("Location not found");

        // Non-admin actors can only delete locations from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const locBusiness = loc.dataValues?.business_code ?? loc.business_code;
            if (locBusiness !== actor.businessCode) {
                throw new Error("Access denied: location does not belong to your business");
            }
        }

        return await repo.delete(locationCode);
    }
}

export default new LocationService();