"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const hashAdmin = await bcrypt.hash("123456", 12);
        const hashPass = await bcrypt.hash("password123", 12);

        // 1. Organization
        await queryInterface.bulkInsert("organizations", [
            {
                organization_code: "ORG00001",
                name: "Wellness Hub Inc.",
                status: "active",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 2. Businesses
        await queryInterface.bulkInsert("businesses", [
            {
                business_code: "BIZ00001",
                organization_code: "ORG00001",
                name: "Downtown Spa & Wellness",
                email: "contact@downtownspa.com",
                phone: "03001110001",
                address: "123 Main Street, Downtown District",
                status: "active",
                user_code: "OWN00001",
                timezone: "America/New_York",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                organization_code: "ORG00001",
                name: "Eastside Medical Clinic",
                email: "contact@eastsideclinic.com",
                phone: "03001110002",
                address: "456 East Avenue, Eastside",
                status: "active",
                user_code: "OWN00002",
                timezone: "America/Chicago",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 3. Users
        await queryInterface.bulkInsert("users", [
            {
                business_code: "0",
                user_code: "ADM00001",
                name: "Admin",
                email: "admin@test.com",
                phone: "03000000000",
                password: hashAdmin,
                user_type: "admin",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00001",
                user_code: "OWN00001",
                name: "Sarah Johnson",
                email: "sarah@downtownspa.com",
                phone: "03001111001",
                password: hashPass,
                user_type: "business_owner",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00002",
                user_code: "OWN00002",
                name: "Michael Chen",
                email: "michael@eastsideclinic.com",
                phone: "03001111002",
                password: hashPass,
                user_type: "business_owner",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00001",
                user_code: "STF00001",
                name: "Emma Williams",
                email: "emma@downtownspa.com",
                phone: "03001112001",
                password: hashPass,
                user_type: "service_staff",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00001",
                user_code: "STF00002",
                name: "James Brown",
                email: "james@downtownspa.com",
                phone: "03001112002",
                password: hashPass,
                user_type: "operational_staff",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00002",
                user_code: "STF00003",
                name: "Olivia Davis",
                email: "olivia@eastsideclinic.com",
                phone: "03001112003",
                password: hashPass,
                user_type: "service_staff",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00001",
                user_code: "CLU00001",
                name: "Alice Thompson",
                email: "alice@gmail.com",
                phone: "03002221001",
                password: hashPass,
                user_type: "client",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00001",
                user_code: "CLU00002",
                name: "Bob Martinez",
                email: "bob@gmail.com",
                phone: "03002221002",
                password: hashPass,
                user_type: "client",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
            {

                business_code: "BIZ00002",
                user_code: "CLU00003",
                name: "Carol White",
                email: "carol@gmail.com",
                phone: "03002221003",
                password: hashPass,
                user_type: "client",
                is_active: "active",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 4. Clients
        await queryInterface.bulkInsert("clients", [
            {
                business_code: "BIZ00001",
                user_code: "CLU00001",
                name: "Alice Thompson",
                email: "alice@gmail.com",
                phone: "03002221001",
                address: "789 Oak Lane, Suburbs",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                user_code: "CLU00002",
                name: "Bob Martinez",
                email: "bob@gmail.com",
                phone: "03002221002",
                address: "321 Pine Ave, Midtown",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                user_code: "CLU00003",
                name: "Carol White",
                email: "carol@gmail.com",
                phone: "03002221003",
                address: "654 Elm St, Northside",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 5. Services
        await queryInterface.bulkInsert("services", [
            {
                business_code: "BIZ00001",
                service_code: "SVC00001",
                name: "Deep Tissue Massage",
                description: "Full-body deep tissue massage targeting muscle tension and chronic pain.",
                price: 80.00,
                cost: 30.00,
                currency: "USD",
                duration_uom: "minutes",
                duration_value: 60,
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                service_code: "SVC00002",
                name: "Facial Treatment",
                description: "Rejuvenating facial with cleansing, exfoliation, and moisturizing.",
                price: 60.00,
                cost: 20.00,
                currency: "USD",
                duration_uom: "minutes",
                duration_value: 45,
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                service_code: "SVC00003",
                name: "Aromatherapy Wrap",
                description: "Full-body aromatherapy wrap using essential oils for relaxation.",
                price: 110.00,
                cost: 40.00,
                currency: "USD",
                duration_uom: "minutes",
                duration_value: 90,
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                service_code: "SVC00004",
                name: "General Consultation",
                description: "Initial medical consultation with a licensed physician.",
                price: 120.00,
                cost: 50.00,
                currency: "USD",
                duration_uom: "minutes",
                duration_value: 30,
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                service_code: "SVC00005",
                name: "Follow-up Visit",
                description: "Follow-up medical consultation after initial treatment.",
                price: 60.00,
                cost: 20.00,
                currency: "USD",
                duration_uom: "minutes",
                duration_value: 20,
                status: "active",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 6. Locations
        await queryInterface.bulkInsert("locations", [
            {
                business_code: "BIZ00001",
                location_code: "LOC00001",
                location_type: "business",
                address: "123 Main Street, Suite 101",
                street: "123 Main Street",
                apartment: "Suite 101",
                city: "New York",
                postal_code: "10001",
                province: "New York",
                country: "USA",
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                location_code: "LOC00002",
                location_type: "business",
                address: "456 East Avenue",
                street: "456 East Avenue",
                apartment: null,
                city: "Chicago",
                postal_code: "60601",
                province: "Illinois",
                country: "USA",
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                location_code: "LOC00003",
                location_type: "client",
                address: "789 Oak Lane",
                street: "789 Oak Lane",
                apartment: null,
                city: "New York",
                postal_code: "10025",
                province: "New York",
                country: "USA",
                status: "active",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 7. Location Services
        await queryInterface.bulkInsert("location_services", [
            { business_code: "BIZ00001", service_code: "SVC00001", location_code: "LOC00001", availability: "available", created_at: now, updated_at: now },
            { business_code: "BIZ00001", service_code: "SVC00002", location_code: "LOC00001", availability: "available", created_at: now, updated_at: now },
            { business_code: "BIZ00001", service_code: "SVC00003", location_code: "LOC00001", availability: "available", created_at: now, updated_at: now },
            { business_code: "BIZ00001", service_code: "SVC00001", location_code: "LOC00003", availability: "available", created_at: now, updated_at: now },
            { business_code: "BIZ00002", service_code: "SVC00004", location_code: "LOC00002", availability: "available", created_at: now, updated_at: now },
            { business_code: "BIZ00002", service_code: "SVC00005", location_code: "LOC00002", availability: "available", created_at: now, updated_at: now },
        ]);

        // 8. Charges
        await queryInterface.bulkInsert("charges", [
            {
                business_code: "BIZ00001",
                charge_code: "CHG00001",
                name: "GST",
                description: "Goods and Services Tax",
                charge_uom: "percentage",
                charge_value: 10.00,
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                charge_code: "CHG00002",
                name: "Booking Fee",
                description: "Fixed booking administration fee",
                charge_uom: "fixed",
                charge_value: 5.00,
                status: "active",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                charge_code: "CHG00003",
                name: "GST",
                description: "Goods and Services Tax",
                charge_uom: "percentage",
                charge_value: 10.00,
                status: "active",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 9. User Shift Schedules
        // NOTE: "wedneday" is intentionally used to match the existing enum typo in migration.
        const weekdays = ["monday", "tuesday", "wedneday", "thursday", "friday"];
        const shiftRows = [];

        for (const day of [...weekdays, "saturday"]) {
            shiftRows.push({ business_code: "BIZ00001", user_code: "OWN00001", working_days: day, employee_type: "permanent", location_code: "LOC00001", start_time: "08:00:00", end_time: "18:00:00", created_at: now, updated_at: now });
        }
        for (const day of weekdays) {
            shiftRows.push({ business_code: "BIZ00001", user_code: "STF00001", working_days: day, employee_type: "permanent", location_code: "LOC00001", start_time: "09:00:00", end_time: "17:00:00", created_at: now, updated_at: now });
        }
        for (const day of weekdays) {
            shiftRows.push({ business_code: "BIZ00001", user_code: "STF00002", working_days: day, employee_type: "permanent", location_code: "LOC00001", start_time: "09:00:00", end_time: "17:00:00", created_at: now, updated_at: now });
        }
        for (const day of weekdays) {
            shiftRows.push({ business_code: "BIZ00002", user_code: "STF00003", working_days: day, employee_type: "permanent", location_code: "LOC00002", start_time: "08:00:00", end_time: "16:00:00", created_at: now, updated_at: now });
        }
        await queryInterface.bulkInsert("user_shift_schedules", shiftRows);

        // 10. User Abilities
        await queryInterface.bulkInsert("user_abilities", [
            { business_code: "BIZ00001", user_code: "OWN00001", user_type: "business_owner", ability: "manage_appointments", status: "active", added_by: "ADM00001", updated_by: "ADM00001", created_at: now, updated_at: now },
            { business_code: "BIZ00001", user_code: "OWN00001", user_type: "business_owner", ability: "manage_staff", status: "active", added_by: "ADM00001", updated_by: "ADM00001", created_at: now, updated_at: now },
            { business_code: "BIZ00001", user_code: "OWN00001", user_type: "business_owner", ability: "manage_services", status: "active", added_by: "ADM00001", updated_by: "ADM00001", created_at: now, updated_at: now },
            { business_code: "BIZ00001", user_code: "STF00001", user_type: "staff", ability: "view_appointments", status: "active", added_by: "OWN00001", updated_by: "OWN00001", created_at: now, updated_at: now },
            { business_code: "BIZ00001", user_code: "STF00001", user_type: "staff", ability: "update_appointment_status", status: "active", added_by: "OWN00001", updated_by: "OWN00001", created_at: now, updated_at: now },
            { business_code: "BIZ00002", user_code: "OWN00002", user_type: "business_owner", ability: "manage_appointments", status: "active", added_by: "ADM00001", updated_by: "ADM00001", created_at: now, updated_at: now },
            { business_code: "BIZ00002", user_code: "OWN00002", user_type: "business_owner", ability: "manage_staff", status: "active", added_by: "ADM00001", updated_by: "ADM00001", created_at: now, updated_at: now },
            { business_code: "BIZ00002", user_code: "STF00003", user_type: "staff", ability: "view_appointments", status: "active", added_by: "OWN00002", updated_by: "OWN00002", created_at: now, updated_at: now },
        ]);

        // 11. Appointments
        await queryInterface.bulkInsert("appointments", [
            {
                business_code: "BIZ00001",
                appointment_code: "APT00001",
                appointment_start_date: "2026-04-10",
                appointment_end_date: "2026-04-10",
                start_time: "09:00:00",
                end_time: "10:00:00",
                location_code: "LOC00001",
                status: "completed",
                created_by: "OWN00001",
                approved_by: "OWN00001",
                cancelled_by: null,
                rescheduled_from: null,
                notes: "Client requested extra focus on lower back.",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                appointment_code: "APT00002",
                appointment_start_date: "2026-05-15",
                appointment_end_date: "2026-05-15",
                start_time: "11:00:00",
                end_time: "11:45:00",
                location_code: "LOC00001",
                status: "approved",
                created_by: "CLU00001",
                approved_by: "OWN00001",
                cancelled_by: null,
                rescheduled_from: null,
                notes: null,
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                appointment_code: "APT00003",
                appointment_start_date: "2026-05-25",
                appointment_end_date: "2026-05-25",
                start_time: "14:00:00",
                end_time: "15:30:00",
                location_code: "LOC00003",
                status: "pending",
                created_by: "CLU00002",
                approved_by: null,
                cancelled_by: null,
                rescheduled_from: null,
                notes: "Home visit requested.",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                appointment_code: "APT00004",
                appointment_start_date: "2026-04-15",
                appointment_end_date: "2026-04-15",
                start_time: "10:00:00",
                end_time: "10:30:00",
                location_code: "LOC00002",
                status: "completed",
                created_by: "OWN00002",
                approved_by: "OWN00002",
                cancelled_by: null,
                rescheduled_from: null,
                notes: null,
                created_at: now,
                updated_at: now,
            },
        ]);

        // 12. Appointment Services
        await queryInterface.bulkInsert("appointment_services", [
            { business_code: "BIZ00001", service_code: "SVC00001", appointment_code: "APT00001", created_at: now, updated_at: now },
            { business_code: "BIZ00001", service_code: "SVC00002", appointment_code: "APT00001", created_at: now, updated_at: now },
            { business_code: "BIZ00001", service_code: "SVC00002", appointment_code: "APT00002", created_at: now, updated_at: now },
            { business_code: "BIZ00001", service_code: "SVC00003", appointment_code: "APT00003", created_at: now, updated_at: now },
            { business_code: "BIZ00002", service_code: "SVC00004", appointment_code: "APT00004", created_at: now, updated_at: now },
        ]);

        // 13. Appointment Participants
        await queryInterface.bulkInsert("appointment_participants", [
            { business_code: "BIZ00001", appointment_code: "APT00001", user_code: "OWN00001", user_type: "business_owner", user_role: "Manager", status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00001", user_code: "STF00001", user_type: "service_staff", user_role: "Therapist", status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00001", user_code: "CLU00001", user_type: "client", user_role: null, status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00002", user_code: "STF00001", user_type: "service_staff", user_role: "Therapist", status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00002", user_code: "CLU00001", user_type: "client", user_role: null, status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00003", user_code: "STF00001", user_type: "service_staff", user_role: "Therapist", status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00003", user_code: "CLU00002", user_type: "client", user_role: null, status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00002", appointment_code: "APT00004", user_code: "OWN00002", user_type: "business_owner", user_role: "Physician", status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00002", appointment_code: "APT00004", user_code: "STF00003", user_type: "service_staff", user_role: "Nurse", status: "active", created_at: now, updated_at: now },
            { business_code: "BIZ00002", appointment_code: "APT00004", user_code: "CLU00003", user_type: "client", user_role: null, status: "active", created_at: now, updated_at: now },
        ]);

        // 14. Appointment Charges
        await queryInterface.bulkInsert("appointment_charges", [
            { business_code: "BIZ00001", appointment_code: "APT00001", charge_code: "CHG00001", charge_uom: "percentage", charge_value: 10.00, created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00002", charge_code: "CHG00001", charge_uom: "percentage", charge_value: 10.00, created_at: now, updated_at: now },
            { business_code: "BIZ00002", appointment_code: "APT00004", charge_code: "CHG00003", charge_uom: "percentage", charge_value: 10.00, created_at: now, updated_at: now },
        ]);

        // 15. Appointment Discounts
        await queryInterface.bulkInsert("appointment_discounts", [
            { business_code: "BIZ00001", appointment_code: "APT00001", service_code: "SVC00001", discount_uom: "percentage", discount_value: 10, created_at: now, updated_at: now },
            { business_code: "BIZ00001", appointment_code: "APT00002", service_code: "SVC00002", discount_uom: "fixed", discount_value: 5, created_at: now, updated_at: now },
        ]);

        // 16. Appointment Recurrence
        await queryInterface.bulkInsert("appointment_recurrence", [
            {
                business_code: "BIZ00001",
                service_code: "SVC00001",
                recurrence_uom: "weekly",
                recurrence_value: 1,
                status: "active",
                auto_cancel_after_days: 7,
                reschedule_after_days: 3,
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                service_code: "SVC00005",
                recurrence_uom: "monthly",
                recurrence_value: 1,
                status: "active",
                auto_cancel_after_days: 14,
                reschedule_after_days: 5,
                created_at: now,
                updated_at: now,
            },
        ]);

        // 17. Appointment History
        await queryInterface.bulkInsert("appointment_history", [
            {
                business_code: "BIZ00001",
                appointment_code: "APT00001",
                action: "created",
                changed_by: "OWN00001",
                old_value: null,
                new_value: JSON.stringify({ status: "pending" }),
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                appointment_code: "APT00001",
                action: "updated",
                changed_by: "OWN00001",
                old_value: JSON.stringify({ status: "pending" }),
                new_value: JSON.stringify({ status: "completed" }),
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                appointment_code: "APT00002",
                action: "created",
                changed_by: "CLU00001",
                old_value: null,
                new_value: JSON.stringify({ status: "pending" }),
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                appointment_code: "APT00004",
                action: "created",
                changed_by: "OWN00002",
                old_value: null,
                new_value: JSON.stringify({ status: "pending" }),
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                appointment_code: "APT00004",
                action: "updated",
                changed_by: "OWN00002",
                old_value: JSON.stringify({ status: "pending" }),
                new_value: JSON.stringify({ status: "completed" }),
                created_at: now,
                updated_at: now,
            },
        ]);

        // 18. Invoices
        await queryInterface.bulkInsert("invoices", [
            {
                business_code: "BIZ00001",
                appointment_code: "APT00001",
                subtotal: 140.00,
                total: 145.20,
                invoice_status: "paid",
                date: "2026-04-10",
                updated_by: "OWN00001",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                appointment_code: "APT00002",
                subtotal: 60.00,
                total: 60.50,
                invoice_status: "issued",
                date: "2026-05-15",
                updated_by: "OWN00001",
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00001",
                appointment_code: "APT00003",
                subtotal: 110.00,
                total: 121.00,
                invoice_status: "draft",
                date: "2026-05-25",
                updated_by: null,
                created_at: now,
                updated_at: now,
            },
            {
                business_code: "BIZ00002",
                appointment_code: "APT00004",
                subtotal: 120.00,
                total: 132.00,
                invoice_status: "paid",
                date: "2026-04-15",
                updated_by: "OWN00002",
                created_at: now,
                updated_at: now,
            },
        ]);
        },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("invoices",                 null, {});
        await queryInterface.bulkDelete("appointment_history",      null, {});
        await queryInterface.bulkDelete("appointment_recurrence",   null, {});
        await queryInterface.bulkDelete("appointment_discounts",    null, {});
        await queryInterface.bulkDelete("appointment_charges",      null, {});
        await queryInterface.bulkDelete("appointment_participants", null, {});
        await queryInterface.bulkDelete("appointment_services",     null, {});
        await queryInterface.bulkDelete("appointments",             null, {});
        await queryInterface.bulkDelete("user_abilities",           null, {});
        await queryInterface.bulkDelete("user_shift_schedules",     null, {});
        await queryInterface.bulkDelete("charges",                  null, {});
        await queryInterface.bulkDelete("location_services",        null, {});
        await queryInterface.bulkDelete("locations",                null, {});
        await queryInterface.bulkDelete("services",                 null, {});
        await queryInterface.bulkDelete("clients",                  null, {});
        await queryInterface.bulkDelete("businesses",               null, {});
        await queryInterface.bulkDelete("users",                    null, {});
        await queryInterface.bulkDelete("organizations",            null, {});
    },
};
