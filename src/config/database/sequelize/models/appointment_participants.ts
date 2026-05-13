const { Model, DataTypes } = require('sequelize');

class AppointmentParticipant extends Model {
    static initModel(sequelize) {
        AppointmentParticipant.init({
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

            user_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            user_type: {
                type: DataTypes.ENUM("BUSINESS_OWNER", "OPERATIONAL_STAFF", "SERVICE_STAFF", "CLIENT"),
                allowNull: false,
            },

            user_role: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },

            status: {
                type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
                allowNull: false,
                defaultValue: "ACTIVE",
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
            modelName: 'AppointmentParticipant',
            tableName: 'appointment_participants',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return AppointmentParticipant;
    }

    static associate(models) {
        // Appointment
        AppointmentParticipant.belongsTo(models.Appointment, {
            foreignKey: "appointment_code",
            targetKey: "appointment_code",
            as: "appointment",
            constraints: false,
        });

        // User
        AppointmentParticipant.belongsTo(models.User, {
            foreignKey: "user_code",
            targetKey: "user_code",
            as: "user",
            constraints: false,
        });

        // Business
        AppointmentParticipant.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });
    }
}

module.exports = AppointmentParticipant;