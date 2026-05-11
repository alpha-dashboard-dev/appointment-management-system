const { Model, DataTypes } = require('sequelize');

class AppointmentDiscount extends Model {
    static initModel(sequelize) {
        AppointmentDiscount.init({
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

            appointment_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            discount_uom: {
                type: DataTypes.ENUM("PERCENTAGE", "FIXED"),
                allowNull: false,
            },

            discount_value: {
                type: DataTypes.INTEGER,
                allowNull: false,
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
            modelName: 'AppointmentDiscount',
            tableName: 'appointment_discounts',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return AppointmentDiscount;
    }

    static associate(models) {

        AppointmentDiscount.belongsTo(models.Appointment, {
            foreignKey: "appointment_code",
            targetKey: "appointment_code",
            as: "appointment",
            constraints: false,
        });

        AppointmentDiscount.belongsTo(models.Service, {
            foreignKey: "service_code",
            targetKey: "service_code",
            as: "service",
            constraints: false,
        });

        AppointmentDiscount.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });
    }
}

module.exports = AppointmentDiscount;