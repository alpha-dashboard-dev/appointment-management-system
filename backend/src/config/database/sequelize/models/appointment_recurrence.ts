const { Model, DataTypes } = require('sequelize');

class AppointmentRecurrence extends Model {
    static initModel(sequelize) {
        AppointmentRecurrence.init({
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

            service_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            recurrence_uom: {
                type: DataTypes.ENUM(
                    "monthly",
                    "daily",
                    "weekly",
                    "fortnightly",
                    "quarterly",
                    "fixed"
                ),
                allowNull: false,
            },

            recurrence_value: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            status: {
                type: DataTypes.ENUM("active", "inactive"),
                allowNull: false,
                defaultValue: "active",
            },

            auto_cancel_after_days: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            reschedule_after_days: {
                type: DataTypes.INTEGER,
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
            modelName: 'AppointmentRecurrence',
            tableName: 'appointment_recurrence',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return AppointmentRecurrence;
    }

    static associate(models) {

        AppointmentRecurrence.belongsTo(models.Service, {
            foreignKey: "service_code",
            targetKey: "service_code",
            as: "service",
            constraints: false,
        });

        AppointmentRecurrence.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });
    }
}

module.exports = AppointmentRecurrence;