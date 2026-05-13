const { Model, DataTypes } = require('sequelize');

class Business extends Model {
    static initModel(sequelize) {
        Business.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            business_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            organization_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },

            phone: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },

            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("active", "inactive"),
                allowNull: false,
                defaultValue: "active",
            },

            user_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
                unique: true,
            },

            timezone: {
                type: DataTypes.STRING(100),
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
            modelName: 'Business',
            tableName: 'businesses',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return Business;
    }

    static associate(models) {
        Business.belongsTo(models.Organization, {
            foreignKey: "organization_code",
            targetKey: "organization_code",
            as: "organization",
            constraints: false,
        });

        Business.hasMany(models.User, {
            foreignKey: "business_code",
            sourceKey: "business_code",
            as: "users",
            constraints: false,
        });

        Business.hasMany(models.Client, {
            foreignKey: "business_code",
            sourceKey: "business_code",
            as: "clients",
            constraints: false,
        });

        Business.hasMany(models.Service, {
            foreignKey: "business_code",
            sourceKey: "business_code",
            as: "services",
            constraints: false,
        });

        Business.hasMany(models.Location, {
            foreignKey: "business_code",
            sourceKey: "business_code",
            as: "locations",
            constraints: false,
        });

        Business.hasMany(models.Appointment, {
            foreignKey: "business_code",
            sourceKey: "business_code",
            as: "appointments",
            constraints: false,
        });
        Business.hasMany(models.Charge, {
            foreignKey: "business_code",
            sourceKey: "business_code",
            as: "charges",
            constraints: false,
        });
    }
}

module.exports = Business;