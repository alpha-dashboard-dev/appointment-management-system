const { Model, DataTypes } = require('sequelize');

class User extends Model {
    static initModel(sequelize) {
        User.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            business_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                defaultValue: "0",
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

            user_type: {
                type: DataTypes.ENUM(
                    "admin",
                    "business_owner",
                    "operational_staff",
                    "service_staff",
                    "client"
                ),
                allowNull: false,
            },

            is_active: {
                type: DataTypes.ENUM("active", "inactive"),
                allowNull: false,
                defaultValue: "active",
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

        User.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });

        User.hasMany(models.UserShiftSchedule, {
            foreignKey: "user_code",
            sourceKey: "user_code",
            as: "shift_schedules",
            constraints: false,
        });

        User.hasMany(models.UserAbility, {
            foreignKey: "user_code",
            sourceKey: "user_code",
            as: "abilities",
            constraints: false,
        });

        User.hasMany(models.Session, {
            foreignKey: "user_code",
            sourceKey: "user_code",
            as: "sessions",
            constraints: false,
        });
    }
}

module.exports = User;