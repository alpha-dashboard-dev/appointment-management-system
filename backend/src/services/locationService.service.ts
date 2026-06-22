import repo from "../repositories/locationService.repository";
import locationRepo from "../repositories/location.repository";
import serviceRepo from "../repositories/service.repository";
import { validateLocationService } from "../utils/validator";
import { ROLES } from "../utils/roles";
import {buildWhere} from "../utils/buildWhere";

class LocationServiceService {

    async create(data: any, actor: any) {
        const { location_code, service_code, availability } = data;

        // Non-admin actors can only create location services for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

        const { business_code } = data;

        validateLocationService(data);

        const location = await locationRepo.findOne({
            location_code: location_code,
        });
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

        const service = await serviceRepo.findOne({
            service_code: service_code,
        });
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

    async getAll(query: any = {}, actor?: any) {

        const where = buildWhere(query)

        // Non-admin actors can only see location services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            where.business_code = actor.businessCode;
        }
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

    async getById(id: number, query: any = {}, actor?: any) {
        const record = await repo.findOne(
            {
                id: id,
            },
            {
                include: Array.isArray(query.include) ? query.include : [],
            }
        );

        if(!record){
            throw new Error("Record not found");
        }

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
        const record = await repo.findOne(
            {id: id}
        );

        if(!record){
            throw new Error("Record not found");
        }

        // Non-admin actors can only update location services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const recBiz = record.dataValues?.business_code ?? record.business_code;
            if (recBiz !== actor.businessCode) {
                throw new Error("Access denied: location service does not belong to your business");
            }
        }

        const allowed: any = {};
        if (data.availability !== undefined) allowed.availability = data.availability;

        return await repo.update(
            { id: id },
            allowed);
    }

    async delete(id: number, actor: any) {
        const record = await repo.findOne(
            {id: id}
        );

        if(!record){
            throw new Error("Record not found");
        }

        // Non-admin actors can only delete location services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const recBiz = record.dataValues?.business_code ?? record.business_code;
            if (recBiz !== actor.businessCode) {
                throw new Error("Access denied: location service does not belong to your business");
            }
        }

        return await repo.delete({
            id: id,
        });
    }
}

export default new LocationServiceService();
