// LocationService service — manages the availability of services at specific locations.
import repo from "../repositories/locationService.repository";
import locationRepo from "../repositories/location.repository";
import serviceRepo from "../repositories/service.repository";
import { validateLocationService } from "../utils/validator";

class LocationServiceService {

    async create(data: any, actor: any) {
        const { businessCode, locationCode, serviceCode, availability } = data;

        validateLocationService(data);

        const location = await locationRepo.findByCode(locationCode);
        if (!location) throw new Error("Location not found");

        const service = await serviceRepo.findByCode(serviceCode);
        if (!service) throw new Error("Service not found");

        return await repo.create({
            businessCode,
            locationCode,
            serviceCode,
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
