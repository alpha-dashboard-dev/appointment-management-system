const { Model, DataTypes } = require('sequelize');

class Appointment extends Model {
    static initModel(sequelize) {
        Appointment.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            business_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            appointment_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            appointment_start_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },

            appointment_end_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },

            start_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },

            end_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },

            location_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            status: {
                type: DataTypes.ENUM(
                    "PENDING",
                    "APPROVED",
                    "IN_PROGRESS",
                    "REJECTED",
                    "COMPLETED",
                    "CANCELLED",
                    "RESCHEDULED"
                ),
                allowNull: false,
                defaultValue: "PENDING",
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            approved_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            cancelled_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            rescheduled_from: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },

            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize,
            modelName: 'Appointment',
            tableName: 'appointments',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return Appointment;
    }

    static associate(models) {
        Appointment.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });

        Appointment.belongsTo(models.User, {
            foreignKey: "created_by",
            as: "creator",
            constraints: false,
        });

        Appointment.belongsTo(models.User, {
            foreignKey: "approved_by",
            as: "approver",
            constraints: false,
        });

        Appointment.belongsTo(models.User, {
            foreignKey: "cancelled_by",
            as: "canceller",
            constraints: false,
        });

        Appointment.belongsTo(models.Appointment, {
            foreignKey: "rescheduled_from",
            as: "rescheduledFromAppointment",
            constraints: false,
        });

        Appointment.hasMany(models.AppointmentHistory, {
            foreignKey: "appointment_code",
            sourceKey: "appointment_code",
            as: "histories",
            constraints: false,
        });

        Appointment.hasMany(models.AppointmentParticipant, {
            foreignKey: "appointment_code",
            sourceKey: "appointment_code",
            as: "participants",
            constraints: false,
        });

        Appointment.hasMany(models.AppointmentService, {
            foreignKey: "appointment_code",
            sourceKey: "appointment_code",
            as: "services",
            constraints: false,
        });

        Appointment.hasMany(models.AppointmentDiscount, {
            foreignKey: "appointment_code",
            sourceKey: "appointment_code",
            as: "discounts",
            constraints: false,
        });

        Appointment.hasMany(models.AppointmentCharge, {
            foreignKey: "appointment_code",
            sourceKey: "appointment_code",
            as: "charges",
            constraints: false,
        });

        Appointment.hasMany(models.Invoice, {
            foreignKey: "appointment_code",
            sourceKey: "appointment_code",
            as: "invoices",
            constraints: false,
        });
    }
}

module.exports = Appointment;