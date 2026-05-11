const { sequelize } = require('../sequelize');

const Organization = require('./Organization');
const User = require('./User');
const Business = require('./Business');
const Client = require('./Client');
const Service = require('./Service');
const Appointment = require('./Appointment');
const AppointmentHistory = require('./AppointmentHistory');
const AppointmentService = require('./AppointmentService');
const AppointmentParticipant = require('./AppointmentParticipant');
const AppointmentDiscount = require('./AppointmentDiscount');
const AppointmentCharge = require('./AppointmentCharge');
const AppointmentRecurrence = require('./AppointmentRecurrence');
const Invoice = require('./Invoice');
const Session = require('./Session');
const Location = require('./Location');
const LocationService = require('./LocationService');
const UserShiftSchedule = require('./UserShiftSchedule');
const UserAbility = require('./UserAbility');
const Charge = require('./Charge');

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