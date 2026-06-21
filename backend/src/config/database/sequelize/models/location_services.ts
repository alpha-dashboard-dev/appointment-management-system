const { Model, DataTypes } = require('sequelize');

class LocationService extends Model {
    static initModel(sequelize) {
        LocationService.init({
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

            location_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            availability: {
                type: DataTypes.ENUM(
                    "available",
                    "not_available",
                ),
                allowNull: false,
                defaultValue: "available",
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
            modelName: 'LocationService',
            tableName: 'location_services',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return LocationService;
    }

    static associate(models) {

        LocationService.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });

        LocationService.belongsTo(models.Service, {
            foreignKey: "service_code",
            targetKey: "service_code",
            as: "service",
            constraints: false,
        });


        LocationService.belongsTo(models.Location, {
            foreignKey: "location_code",
            targetKey: "location_code",
            as: "location",
            constraints: false,
        });
    }
}

module.exports = LocationService;