const { Model, DataTypes } = require('sequelize');

class User extends Model {
    static initModel(sequelize) {
        User.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            organizationCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
                field: "organization_code",
            },

            userCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
                field: "user_code",
            },

            businessCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                defaultValue: "0",
                field: "business_code",
            },

            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },

            phone: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },

            password: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            userType: {
                type: DataTypes.ENUM(
                    "ADMIN",
                    "BUSINESS_OWNER",
                    "OPERATIONAL_STAFF",
                    "SERVICE_STAFF",
                    "CLIENT"
                ),
                allowNull: false,
                field: "user_type",
            },

            isActive: {
                type: DataTypes.ENUM("active", "inactive"),
                allowNull: false,
                defaultValue: "active",
                field: "is_active",
            },

            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'created_at',
            },

            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'updated_at',
            },
        }, {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return User;
    }

    static associate(models) {
        User.belongsTo(models.Organization, {
            foreignKey: "organizationCode",
            targetKey: "organizationCode",
            as: "organization",
            constraints: false,
        });

        User.belongsTo(models.Business, {
            foreignKey: "businessCode",
            targetKey: "businessCode",
            as: "business",
            constraints: false,
        });

        User.hasMany(models.UserShiftSchedule, {
            foreignKey: "userCode",
            sourceKey: "userCode",
            as: "shift_schedules",
            constraints: false,
        });

        User.hasMany(models.UserAbility, {
            foreignKey: "userCode",
            sourceKey: "userCode",
            as: "abilities",
            constraints: false,
        });

        User.hasMany(models.Session, {
            foreignKey: "userCode",
            sourceKey: "userCode",
            as: "sessions",
            constraints: false,
        });
    }
}

module.exports = User;