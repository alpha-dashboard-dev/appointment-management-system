const { Model, DataTypes } = require('sequelize');

class AppointmentHistory extends Model {
    static initModel(sequelize) {
        AppointmentHistory.init({
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
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            action: {
                type: DataTypes.ENUM(
                    "CREATED",
                    "UPDATED",
                    "ASSIGNED",
                    "RESCHEDULED",
                    "CANCELLED"
                ),
                allowNull: false,
            },

            changed_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            old_value: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            new_value: {
                type: DataTypes.JSON,
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
            modelName: 'AppointmentHistory',
            tableName: 'appointment_history',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return AppointmentHistory;
    }

    static associate(models) {
        // Appointment
        AppointmentHistory.belongsTo(models.Appointment, {
            foreignKey: "appointment_code",
            targetKey: "appointment_code",
            as: "appointment",
            constraints: false,
        });

        // User (who made the change)
        AppointmentHistory.belongsTo(models.User, {
            foreignKey: "changed_by",
            targetKey: "id",
            as: "changedByUser",
            constraints: false,
        });

        // Business
        AppointmentHistory.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });
    }
}

module.exports = AppointmentHistory;