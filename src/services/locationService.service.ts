import repo from "../repositories/locationService.repository";
import locationRepo from "../repositories/location.repository";
import serviceRepo from "../repositories/service.repository";
import { validateLocationService } from "../utils/validator";
import { ROLES } from "../utils/roles";

class LocationServiceService {

    async create(data: any, actor: any) {
        const { location_code, service_code, availability } = data;

        // Non-admin actors can only create location services for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

        const { business_code } = data;

        validateLocationService(data);

        const location = await locationRepo.findByCode(location_code);
        if ((location.dataValues?.status ?? location.status) !== "active") {
            throw new Error("Cannot add services to an inactive location");
        }

        // Verify the location belongs to this business for non-admin
        if (actor && actor.userType !== ROLES.ADMIN) {
            const locBiz = location.dataValues?.business_code ?? location.business_code;
            if (locBiz !== actor.businessCode) {
                throw new Error("Access denied: location does not belong to your business");
            }
        }

        const service = await serviceRepo.findByCode(service_code);
        if ((service.dataValues?.status ?? service.status) !== "active") {
            throw new Error("Cannot map an inactive service to a location");
        }

        // Verify the service belongs to this business for non-admin
        if (actor && actor.userType !== ROLES.ADMIN) {
            const svcBiz = service.dataValues?.business_code ?? service.business_code;
            if (svcBiz !== actor.businessCode) {
                throw new Error("Access denied: service does not belong to your business");
            }
        }

        return await repo.create({
            business_code,
            location_code,
            service_code,
            availability: availability || "available",
        });
    }

    async getAll(filters: any = {}, actor?: any) {
        // Non-admin actors can only see location services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }
        return await repo.findAll(filters);
    }

    async getById(id: number, actor?: any) {
        const record = await repo.findById(id);

        // Non-admin actors can only view location services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const recBiz = record.dataValues?.business_code ?? record.business_code;
            if (recBiz !== actor.businessCode) {
                throw new Error("Access denied: location service does not belong to your business");
            }
        }

        return record;
    }

    async update(id: number, data: any, actor: any) {
        const record = await repo.findById(id);

        // Non-admin actors can only update location services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const recBiz = record.dataValues?.business_code ?? record.business_code;
            if (recBiz !== actor.businessCode) {
                throw new Error("Access denied: location service does not belong to your business");
            }
        }

        const allowed: any = {};
        if (data.availability !== undefined) allowed.availability = data.availability;

        return await repo.update(id, allowed);
    }

    async delete(id: number, actor: any) {
        const record = await repo.findById(id);

        // Non-admin actors can only delete location services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const recBiz = record.dataValues?.business_code ?? record.business_code;
            if (recBiz !== actor.businessCode) {
                throw new Error("Access denied: location service does not belong to your business");
            }
        }

        return await repo.delete(id);
    }
}

export default new LocationServiceService();
