import { sequelize } from "../sequelize";
import { DataTypes } from "sequelize";


import organizationModel from "./organization";
import userModel from "./user";
import businessModel from "./business";
import clientModel from "./client";
import serviceModel from "./services";
import appointmentModel from "./appointment";
import appointmentHistoryModel from "./appointmentHistory";
import appointmentServiceModel from "./appointment_services";
import appointmentParticipantModel from "./appointment_participants";
import appointmentDiscountModel from "./appointment_discounts";
import appointmentChargeModel from "./appointment_charges";
import appointmentRecurrenceModel from "./appointment_recurrence";
import invoiceModel from "./invoices";
import sessionModel from "./session";
import locationModel from "./locations";
import locationServiceModel from "./location_services";
import userShiftScheduleModel from "./user_shift_schedule";
import userAbilityModel from "./user_abilities";
import chargeModel from "./charges";

export const db: any = {};

db.sequelize = sequelize;
db.Sequelize = DataTypes;


db.Organization = organizationModel(sequelize, DataTypes);

db.User = userModel(sequelize, DataTypes);

db.Business = businessModel(sequelize, DataTypes);

db.Client = clientModel(sequelize, DataTypes);

db.Service = serviceModel(sequelize, DataTypes);

db.Appointment = appointmentModel(sequelize, DataTypes);

db.AppointmentHistory = appointmentHistoryModel(
    sequelize,
    DataTypes
);

db.AppointmentService = appointmentServiceModel(
    sequelize,
    DataTypes
);

db.AppointmentParticipant =
    appointmentParticipantModel(sequelize, DataTypes);

db.AppointmentDiscount =
    appointmentDiscountModel(sequelize, DataTypes);

db.AppointmentCharge =
    appointmentChargeModel(sequelize, DataTypes);

db.AppointmentRecurrence =
    appointmentRecurrenceModel(sequelize, DataTypes);

db.Invoice = invoiceModel(sequelize, DataTypes);

db.Session = sessionModel(sequelize, DataTypes);

db.Location = locationModel(sequelize, DataTypes);

db.LocationService = locationServiceModel(
    sequelize,
    DataTypes
);

db.UserShiftSchedule =
    userShiftScheduleModel(sequelize, DataTypes);

db.UserAbility = userAbilityModel(
    sequelize,
    DataTypes
);

db.Charge = chargeModel(sequelize, DataTypes);

db.Organization.hasMany(db.User, {
    foreignKey: "organizationCode",
    sourceKey: "organizationCode",
    constraints: false,
});

db.User.belongsTo(db.Organization, {
    foreignKey: "organizationCode",
    targetKey: "organizationCode",
    constraints: false,
});


db.Business.hasMany(db.User, {
    foreignKey: "businessCode",
    sourceKey: "businessCode",
    constraints: false,
});

db.User.belongsTo(db.Business, {
    foreignKey: "businessCode",
    targetKey: "businessCode",
    constraints: false,
});

db.Business.hasMany(db.Client, {
    foreignKey: "businessCode",
    sourceKey: "businessCode",
    constraints: false,
});

db.Client.belongsTo(db.Business, {
    foreignKey: "businessCode",
    targetKey: "businessCode",
    constraints: false,
});

db.Business.hasMany(db.Service, {
    foreignKey: "businessCode",
    sourceKey: "businessCode",
    constraints: false,
});

db.Service.belongsTo(db.Business, {
    foreignKey: "businessCode",
    targetKey: "businessCode",
    constraints: false,
});

db.User.hasMany(db.UserShiftSchedule, {
    foreignKey: "userCode",
    sourceKey: "userCode",
    constraints: false,
});

db.UserShiftSchedule.belongsTo(db.User, {
    foreignKey: "userCode",
    targetKey: "userCode",
    constraints: false,
});


db.User.hasMany(db.UserAbility, {
    foreignKey: "userCode",
    sourceKey: "userCode",
    constraints: false,
});

db.UserAbility.belongsTo(db.User, {
    foreignKey: "userCode",
    targetKey: "userCode",
    constraints: false,
});

db.Business.hasMany(db.Location, {
    foreignKey: "businessCode",
    sourceKey: "businessCode",
    constraints: false,
});

db.Location.belongsTo(db.Business, {
    foreignKey: "businessCode",
    targetKey: "businessCode",
    constraints: false,
});


db.Location.hasMany(db.LocationService, {
    foreignKey: "locationCode",
    sourceKey: "locationCode",
    constraints: false,
});

db.LocationService.belongsTo(db.Location, {
    foreignKey: "locationCode",
    targetKey: "locationCode",
    constraints: false,
});

db.Service.hasMany(db.LocationService, {
    foreignKey: "serviceCode",
    sourceKey: "serviceCode",
    constraints: false,
});

db.LocationService.belongsTo(db.Service, {
    foreignKey: "serviceCode",
    targetKey: "serviceCode",
    constraints: false,
});


db.Business.hasMany(db.Appointment, {
    foreignKey: "businessId",
    sourceKey: "businessCode",
    constraints: false,
});

db.Appointment.belongsTo(db.Business, {
    foreignKey: "businessId",
    targetKey: "businessCode",
    constraints: false,
});


db.Appointment.hasMany(db.AppointmentHistory, {
    foreignKey: "appointmentCode",
    sourceKey: "appointmentCode",
    constraints: false,
});

db.AppointmentHistory.belongsTo(db.Appointment, {
    foreignKey: "appointmentCode",
    targetKey: "appointmentCode",
    constraints: false,
});


db.Appointment.hasMany(db.AppointmentParticipant, {
    foreignKey: "appointmentCode",
    sourceKey: "appointmentCode",
    constraints: false,
});

db.AppointmentParticipant.belongsTo(db.Appointment, {
    foreignKey: "appointmentCode",
    targetKey: "appointmentCode",
    constraints: false,
});


db.Appointment.hasMany(db.AppointmentService, {
    foreignKey: "quotationId",
    sourceKey: "quotationId",
    constraints: false,
});

db.AppointmentService.belongsTo(db.Appointment, {
    foreignKey: "quotationId",
    targetKey: "quotationId",
    constraints: false,
});


db.Appointment.hasMany(db.AppointmentDiscount, {
    foreignKey: "appointmentCode",
    sourceKey: "appointmentCode",
    constraints: false,
});

db.AppointmentDiscount.belongsTo(db.Appointment, {
    foreignKey: "appointmentCode",
    targetKey: "appointmentCode",
    constraints: false,
});


db.Appointment.hasMany(db.AppointmentCharge, {
    foreignKey: "appointmentCode",
    sourceKey: "appointmentCode",
    constraints: false,
});

db.AppointmentCharge.belongsTo(db.Appointment, {
    foreignKey: "appointmentCode",
    targetKey: "appointmentCode",
    constraints: false,
});


db.Service.hasMany(db.AppointmentRecurrence, {
    foreignKey: "serviceCode",
    sourceKey: "serviceCode",
    constraints: false,
});

db.AppointmentRecurrence.belongsTo(db.Service, {
    foreignKey: "serviceCode",
    targetKey: "serviceCode",
    constraints: false,
});

db.Appointment.hasMany(db.Invoice, {
    foreignKey: "appointmentCode",
    sourceKey: "appointmentCode",
    constraints: false,
});

db.Invoice.belongsTo(db.Appointment, {
    foreignKey: "appointmentCode",
    targetKey: "appointmentCode",
    constraints: false,
});


db.User.hasMany(db.Session, {
    foreignKey: "userCode",
    sourceKey: "userCode",
    constraints: false,
});

db.Session.belongsTo(db.User, {
    foreignKey: "userCode",
    targetKey: "userCode",
    constraints: false,
});

db.Business.hasMany(db.Charge, {
    foreignKey: "businessCode",
    sourceKey: "businessCode",
    constraints: false,
});

db.Charge.belongsTo(db.Business, {
    foreignKey: "businessCode",
    targetKey: "businessCode",
    constraints: false,
});

export default db;