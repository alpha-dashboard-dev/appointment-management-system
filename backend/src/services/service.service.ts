import repo from "../repositories/service.repository";
import locationRepo from "../repositories/location.repository";
import locationServiceRepo from "../repositories/locationService.repository";
import chargeRepo from "../repositories/charge.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateService } from "../utils/validator";
import { ROLES } from "../utils/roles";

class ServiceService {

    async create(data: any, actor: any) {
        // Non-admin actors can only create services for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

        const { name, business_code, description, price, cost, currency, duration_uom, duration_value, status } = data;

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
            status: status,
        });
    }

    async getAll(query: any = {}, actor?: any) {
        const filters: any = {
            business_code:
                query.business_code,
        };

        const options = {
            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],

            limit:
                query.limit
                    ? Number(query.limit)
                    : undefined,

            offset:
                query.offset
                    ? Number(query.offset)
                    : undefined,

            order: [
                [
                    query.sort_by || "created_at",

                    query.sort_order || "DESC",
                ],
            ],
        };

        // Non-admin, non-client actors can only see services from their own business
        if (actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT) {
            filters.business_code = actor.businessCode;
        }
        // Clients pass business_code as a query param; don't override it
        return await repo.findAll(
            filters,
            options
        );
    }

    async getByCode(
        serviceCode: string,
        actor?: any,
        query: any = {}
    ) {
        const options = {
            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],
        };

        const service = await repo.findByCode(
            serviceCode,
            options
        );
        if (!service) throw new Error("Service not found");

        // Non-admin actors can only view services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const serviceBusiness = service.dataValues?.business_code ?? service.business_code;
            if (serviceBusiness !== actor.businessCode) {
                throw new Error("Access denied: service does not belong to your business");
            }
        }

        return service;
    }

    async update(serviceCode: string, data: any, actor: any) {
        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");

        // Non-admin actors can only update services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const serviceBusiness = service.dataValues?.business_code ?? service.business_code;
            if (serviceBusiness !== actor.businessCode) {
                throw new Error("Access denied: service does not belong to your business");
            }
        }

        const allowed: any = {};
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
        if (data.status !== undefined)
            allowed.status = data.status;

        return await repo.update(serviceCode, allowed);
    }

    async changeStatus(serviceCode: string, status: string, user: any) {
        if (!user || (user.userType !== ROLES.ADMIN && user.userType !== ROLES.BUSINESS_OWNER)) {
            throw new Error("Only admin and business owner can change service status");
        }
        if (!["active", "inactive"].includes(status)) {
            throw new Error("Invalid status");
        }

        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");

        // Business owners can only change status of their own services
        if (user.userType === ROLES.BUSINESS_OWNER) {
            const serviceBusiness = service.dataValues?.business_code ?? service.business_code;
            if (serviceBusiness !== user.businessCode) {
                throw new Error("Access denied: service does not belong to your business");
            }
        }

        return await repo.update(serviceCode, { status });
    }

    async delete(serviceCode: string, actor: any) {
        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");

        // Non-admin actors can only delete services from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const serviceBusiness = service.dataValues?.business_code ?? service.business_code;
            if (serviceBusiness !== actor.businessCode) {
                throw new Error("Access denied: service does not belong to your business");
            }
        }

        return await repo.delete(serviceCode);
    }
    async getServicesForClient(businessCode: string, locationCode?: string) {
        const allServices = await repo.findAll({ business_code: businessCode });
        const activeServices = allServices.filter(
            (s: any) => (s.dataValues?.status ?? s.status) === "active"
        );

        // Find service_codes that have ANY location restriction
        const allMappings = await locationServiceRepo.findAll({ business_code: businessCode });
        const mappedServiceCodes = new Set(
            allMappings.map((m: any) => m.dataValues?.service_code ?? m.service_code)
        );

        // Services not in location_services table are available everywhere
        const universalServices = activeServices.filter(
            (s: any) => !mappedServiceCodes.has(s.dataValues?.service_code ?? s.service_code)
        );

        let locationSpecificServices: any[] = [];

        if (locationCode) {
            const location = await locationRepo.findByCode(locationCode);
            const locStatus = location?.dataValues?.status ?? location?.status;
            if (!location || locStatus !== "active") {
                throw new Error("Location not found or inactive");
            }

            const locationMappings = await locationServiceRepo.findAll({ location_code: locationCode });
            const locationServiceCodes = new Set(
                locationMappings.map((m: any) => m.dataValues?.service_code ?? m.service_code)
            );

            locationSpecificServices = activeServices.filter(
                (s: any) => locationServiceCodes.has(s.dataValues?.service_code ?? s.service_code)
            );
        }

        const services = locationCode
            ? [...universalServices, ...locationSpecificServices]
            : activeServices;

        const charges = await chargeRepo.findActiveByBusiness(businessCode);

        return { services, charges };
    }

    async getAllServicesWithBusiness(query: any = {}, actor?: any) {
        const filters: any = {
            business_code:
                query.business_code,
        };

        // Non-admin, non-client actors can only see services from their own business
        if (actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT) {
            filters.business_code = actor.businessCode;
        }
        // Clients pass business_code as a query param; don't override it
        return await repo.findAllServicesWithBusiness(filters);
    }

}
export default new ServiceService();
