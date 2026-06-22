import repo from "../repositories/location.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateLocation } from "../utils/validator";
import { ROLES } from "../utils/roles";
import {buildWhere} from "../utils/buildWhere";

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

    async getAll(query: any = {}, actor?: any) {

        const where = buildWhere(query)
        // Non-admin, non-client actors can only see locations from their own business
        if (actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT) {
            where.business_code = actor.businessCode;
        }
        // Clients pass business_code as query param; don't override it
        return await repo.findAll({
            where,
            include: Array.isArray(query.include) ? query.include : [],
            limit: query.limit ? Number(query.limit) : undefined,
            offset: query.offset ? Number(query.offset) : undefined,
            order: [
                [
                    query.sort_by || "created_at",
                    query.sort_order || "DESC"
                ]
            ]
        });
    }

    async getByCode(
        locationCode: string,
        actor?: any,
        query: any = {}
    ) {

        const loc = await repo.findOne(
            {
                location_code: locationCode,
            },
            {
                include: Array.isArray(query.include) ? query.include : [],

            }
        );
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

    async getOne(query: any = {}, actor: any) {
        const location = await repo.findOne(
            {
                include: query.include || []
            }
        );

        if (!location) {
            throw new Error("Location not found");
        }

        if (actor && actor.userType !== ROLES.ADMIN) {
            const serviceBusiness = location.dataValues?.business_code ?? location.business_code;
            if (serviceBusiness !== actor.businessCode) {
                throw new Error("Access denied: Location does not belong to your business");
            }
        }

        return location;
    }

    async update(locationCode: string, data: any, actor: any) {
        const loc = await repo.findOne({
            location_code: locationCode,
        });
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

        return await repo.update(
            {location_code: locationCode},
            allowed);
    }

    async delete(locationCode: string, actor: any) {
        const loc = await repo.findOne(
            {   location_code: locationCode, },
        );
        if (!loc) throw new Error("Location not found");

        // Non-admin actors can only delete locations from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const locBusiness = loc.dataValues?.business_code ?? loc.business_code;
            if (locBusiness !== actor.businessCode) {
                throw new Error("Access denied: location does not belong to your business");
            }
        }

        return await repo.delete(
            {location_code: locationCode},
        );
    }

    async deactivate(locationCode: string, status: string, user: any) {
        if (!user || (user.userType !== ROLES.ADMIN && user.userType !== ROLES.BUSINESS_OWNER)) {
            throw new Error("Only admin and business owner can change Location status");
        }

        if (!["active", "inactive"].includes(status)) {
            throw new Error("Invalid status");
        }

        const location = await repo.findOne({
            location_code: locationCode,
        });
        if (!location) throw new Error("Location not found");

        // Business owners can only change status of their own services
        if (user.userType === ROLES.BUSINESS_OWNER) {
            const locationBusiness = location.dataValues?.business_code ?? location.business_code;
            if (locationBusiness !== user.businessCode) {
                throw new Error("Access denied: location does not belong to your business");
            }
        }

        return await repo.deactivate(
            {
                location_code: locationCode,
            },
            // status
            {
                status
            }
        );
    }
}

export default new LocationService();