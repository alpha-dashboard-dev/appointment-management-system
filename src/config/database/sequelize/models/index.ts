const { sequelize } = require('../sequelize');

const Organization = require('./organization');
const User = require('./user');
const Business = require('./business');
const Client = require('./client');
const Service = require('./services');
const Appointment = require('./appointment');
const AppointmentHistory = require('./appointmentHistory');
const AppointmentService = require('./appointment_services');
const AppointmentParticipant = require('./appointment_participants');
const AppointmentDiscount = require('./appointment_discounts');
const AppointmentCharge = require('./appointment_charges');
const AppointmentRecurrence = require('./appointment_recurrence');
const Invoice = require('./invoices');
const Session = require('./session');
const Location = require('./locations');
const LocationService = require('./location_services');
const UserShiftSchedule = require('./user_shift_schedule');
const UserAbility = require('./user_abilities');
const Charge = require('./charges');

module.exports = () => {
    const models = {
        Organization: Organization.initModel(sequelize),
        User: User.initModel(sequelize),
        Business: Business.initModel(sequelize),
        Client: Client.initModel(sequelize),
        Service: Service.initModel(sequelize),
        Appointment: Appointment.initModel(sequelize),
        AppointmentHistory: AppointmentHistory.initModel(sequelize),
        AppointmentService: AppointmentService.initModel(sequelize),
        AppointmentParticipant: AppointmentParticipant.initModel(sequelize),
        AppointmentDiscount: AppointmentDiscount.initModel(sequelize),
        AppointmentCharge: AppointmentCharge.initModel(sequelize),
        AppointmentRecurrence: AppointmentRecurrence.initModel(sequelize),
        Invoice: Invoice.initModel(sequelize),
        Session: Session.initModel(sequelize),
        Location: Location.initModel(sequelize),
        LocationService: LocationService.initModel(sequelize),
        UserShiftSchedule: UserShiftSchedule.initModel(sequelize),
        UserAbility: UserAbility.initModel(sequelize),
        Charge: Charge.initModel(sequelize),
    };

    Object.values(models).forEach((model) => {
        if (typeof model.associate === 'function') {
            model.associate(models);
        }
    });

    return {
        sequelize,
        ...models,
    };
};