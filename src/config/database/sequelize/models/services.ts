const { Model, DataTypes } = require('sequelize');

class Service extends Model {
    static initModel(sequelize) {
        Service.init({
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
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },

            cost: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },

            currency: {
                type: DataTypes.STRING(10),
                allowNull: true,
                defaultValue: "USD",
            },

            duration_uom: {
                type: DataTypes.ENUM(
                    "week",
                    "day",
                    "hour",
                    "minutes"
                ),
                allowNull: true,
            },

            duration_value: {
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
            modelName: 'Service',
            tableName: 'services',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return Service;
    }

    static associate(models) {
        // Business
        Service.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });

        // Location Services
        Service.hasMany(models.LocationService, {
            foreignKey: "service_code",
            sourceKey: "service_code",
            as: "location_services",
            constraints: false,
        });

        // Appointment Services
        Service.hasMany(models.AppointmentService, {
            foreignKey: "service_code",
            sourceKey: "service_code",
            as: "appointment_services",
            constraints: false,
        });

        // Appointment Discounts
        Service.hasMany(models.AppointmentDiscount, {
            foreignKey: "service_code",
            sourceKey: "service_code",
            as: "appointment_discounts",
            constraints: false,
        });

        // Appointment Recurrence
        Service.hasMany(models.AppointmentRecurrence, {
            foreignKey: "service_code",
            sourceKey: "service_code",
            as: "appointment_recurrences",
            constraints: false,
        });
    }
}

module.exports = Service;