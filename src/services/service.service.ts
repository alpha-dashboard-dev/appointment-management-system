import repo from "../repositories/service.repository";
import locationRepo from "../repositories/location.repository";
import locationServiceRepo from "../repositories/locationService.repository";
import chargeRepo from "../repositories/charge.repository";
import { generateCode } from "../utils/codeGenerator";
import { validateService } from "../utils/validator";

class ServiceService {

    async create(data: any, actor: any) {

        const { name, business_code, description, price, cost, currency, duration_uom, duration_value, status } = data;
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
            status: status,
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
        // if (data.availability !== undefined)
        //     allowed.availability = data.availability;

        return await repo.update(serviceCode, allowed);
    }

    async changeStatus(serviceCode: string, status: string, user: any) {
        // console.log(user.userType, serviceCode, status)

        if(!user && user.userType !== "admin" || user.userType !== "business_owner") {
            throw new Error("only admin and business owner can change service status");
        }
        if (!["active", "inactive"].includes(status)) {
            throw new Error("Invalid status");
        }

        return await repo.update(serviceCode, {
            status: status,
        });
    }

    async delete(serviceCode: string, actor: any) {
        const service = await repo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");
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
}
export default new ServiceService();
