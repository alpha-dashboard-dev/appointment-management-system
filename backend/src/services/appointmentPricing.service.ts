/**
 * Handles appointment pricing computation and invoice management
 * Extracted from AppointmentService to separate concerns
 */
import appointmentChargeRepo from "../repositories/appointmentCharge.repository";
import chargeRepo from "../repositories/charge.repository";
import invoiceRepo from "../repositories/invoice.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import serviceRepo from "../repositories/service.repository";

import { extractRow, toAmount, roundMoney } from "../utils/serviceHelpers";

export class AppointmentPricingService {
    /**
     * Compute charge amount based on UOM (percentage or fixed)
     */
    private computeChargeAmount(baseAmount: number, chargeUom: string, chargeValue: any): number {
        const normalizedUom = String(chargeUom || "").toLowerCase();
        const value = toAmount(chargeValue);
        if (normalizedUom === "percentage") {
            return roundMoney((baseAmount * value) / 100);
        }
        return roundMoney(value);
    }

    /**
     * Calculate pricing from service codes and charges
     */
    async calculatePricing(
        businessCode: string,
        serviceCodes: string[],
        chargeRows: any[]
    ): Promise<any> {
        let serviceSubtotal = 0;
        let currency: string | null = null;
        const servicesBreakdown: any[] = [];

        // Sum service prices
        for (const code of serviceCodes) {
            const service = await serviceRepo.findByCode(code);
            if (!service) continue;
            const s = extractRow(service);
            if (s.business_code !== businessCode) continue;

            const price = roundMoney(toAmount(s.price));
            serviceSubtotal += price;
            if (!currency && s.currency) currency = s.currency;

            servicesBreakdown.push({
                service_code: s.service_code,
                name: s.name,
                price,
                currency: s.currency || null,
            });
        }

        serviceSubtotal = roundMoney(serviceSubtotal);

        // Apply charges
        let chargeTotal = 0;
        const chargesBreakdown = (chargeRows || []).map((charge: any) => {
            const c = extractRow(charge);
            const computedAmount = this.computeChargeAmount(serviceSubtotal, c.charge_uom, c.charge_value);
            chargeTotal += computedAmount;
            return {
                charge_code: c.charge_code,
                name: c.name || null,
                charge_uom: c.charge_uom,
                charge_value: toAmount(c.charge_value),
                computed_amount: computedAmount,
            };
        });

        chargeTotal = roundMoney(chargeTotal);
        const subtotal = serviceSubtotal;
        const total = roundMoney(subtotal + chargeTotal);

        return {
            currency: currency || "PKR",
            service_subtotal: serviceSubtotal,
            discount_total: 0,
            subtotal,
            charge_total: chargeTotal,
            total,
            services: servicesBreakdown,
            charges: chargesBreakdown,
        };
    }

    /**
     * Apply active business charges to an appointment
     */
    async applyActiveCharges(businessCode: string, appointmentCode: string): Promise<void> {
        const existing = await appointmentChargeRepo.findByAppointment(appointmentCode);
        const existingCodes = new Set(
            (existing || []).map((row: any) => {
                const r = extractRow(row);
                return r.charge_code;
            })
        );

        const activeCharges = await chargeRepo.findActiveByBusiness(businessCode);
        for (const charge of activeCharges) {
            const chargeData = extractRow(charge);
            if (existingCodes.has(chargeData.charge_code)) continue;

            await appointmentChargeRepo.create({
                business_code: businessCode,
                appointment_code: appointmentCode,
                charge_code: chargeData.charge_code,
                charge_uom: chargeData.charge_uom,
                charge_value: chargeData.charge_value,
            });
        }
    }

    /**
     * Upsert a draft invoice for the appointment
     */
    async upsertDraftInvoice(
        businessCode: string,
        appointmentCode: string,
        subtotal: number,
        total: number,
        updatedBy: string | null
    ): Promise<void> {
        const existingInvoices = await invoiceRepo.findByAppointment(appointmentCode);
        const existing = existingInvoices?.[0];

        const invoiceData = {
            subtotal,
            total,
            invoice_status: "draft",
            date: new Date().toISOString().split("T")[0],
            updated_by: updatedBy,
        };

        if (existing) {
            const id = (existing as any).id;
            await invoiceRepo.update(id, invoiceData);
        } else {
            await invoiceRepo.create({
                business_code: businessCode,
                appointment_code: appointmentCode,
                ...invoiceData,
            });
        }
    }

    /**
     * Compute and return complete appointment pricing
     */
    async computeAppointmentPricing(businessCode: string, appointmentCode: string): Promise<any> {
        const appointmentServices = await appointmentServiceRepo.findByAppointment(appointmentCode);
        const serviceCodes = (appointmentServices || []).map((item: any) => {
            const row = extractRow(item);
            return row.service_code;
        });

        const appointmentCharges = await appointmentChargeRepo.findByAppointment(appointmentCode);
        return this.calculatePricing(businessCode, serviceCodes, appointmentCharges || []);
    }

    /**
     * Get pricing preview for services and active charges
     */
    async getPricingPreview(businessCode: string, serviceCodes: string[]): Promise<any> {
        const activeCharges = await chargeRepo.findActiveByBusiness(businessCode);
        const pricing = await this.calculatePricing(businessCode, serviceCodes, activeCharges || []);

        return {
            business_code: businessCode,
            service_codes: serviceCodes,
            ...pricing,
        };
    }
}

export default new AppointmentPricingService();
