const { Model, DataTypes } = require('sequelize');

class Location extends Model {
    static initModel(sequelize) {
        Location.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            business_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            location_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            location_type: {
                type: DataTypes.ENUM(
                    "BUSINESS",
                    "CLIENT"
                ),
                allowNull: false,
            },

            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            street: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },

            apartment: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },

            city: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },

            postal_code: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },

            province: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },

            country: {
                type: DataTypes.STRING(200),
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
            modelName: 'Location',
            tableName: 'locations',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return Location;
    }

    static associate(models) {

        Location.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });

        Location.hasMany(models.LocationService, {
            foreignKey: "location_code",
            sourceKey: "location_code",
            as: "location_services",
            constraints: false,
        });
    }
}

module.exports = Location;