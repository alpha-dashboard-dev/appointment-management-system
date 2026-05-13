import repo from "../repositories/locationService.repository";
import locationRepo from "../repositories/location.repository";
import serviceRepo from "../repositories/service.repository";
import { validateLocationService } from "../utils/validator";

class LocationServiceService {

    async create(data: any, actor: any) {
        const { business_code, location_code, service_code, availability } = data;

        validateLocationService(data);

        const location = await locationRepo.findByCode(location_code);
        if (!location) throw new Error("Location not found");

        const service = await serviceRepo.findByCode(service_code);
        if (!service) throw new Error("Service not found");

        return await repo.create({
            business_code,
            location_code,
            service_code,
            availability: availability || "AVAILABLE",
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getById(id: number) {
        const record = await repo.findById(id);
        if (!record) throw new Error("Location service not found");
        return record;
    }

    async update(id: number, data: any, actor: any) {
        const record = await repo.findById(id);
        if (!record) throw new Error("Location service not found");

        const allowed: any = {};
        if (data.availability !== undefined) allowed.availability = data.availability;

        return await repo.update(id, allowed);
    }

    async delete(id: number, actor: any) {
        const record = await repo.findById(id);
        if (!record) throw new Error("Location service not found");
        return await repo.delete(id);
    }
}

export default new LocationServiceService();