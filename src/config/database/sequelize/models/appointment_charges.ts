const { Model, DataTypes } = require('sequelize');

class AppointmentCharge extends Model {
    static initModel(sequelize) {
        AppointmentCharge.init({
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

            charge_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            charge_uom: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            charge_value: {
                type: DataTypes.ENUM("GST"),
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
            modelName: 'AppointmentCharge',
            tableName: 'appointment_charges',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return AppointmentCharge;
    }

    static associate(models) {
        // Appointment
        AppointmentCharge.belongsTo(models.Appointment, {
            foreignKey: "appointment_code",
            targetKey: "appointment_code",
            as: "appointment",
            constraints: false,
        });

        // Business
        AppointmentCharge.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });
    }
}

module.exports = AppointmentCharge;