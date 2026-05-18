const { Model, DataTypes } = require('sequelize');

class UserShiftSchedule extends Model {
    static initModel(sequelize) {
        UserShiftSchedule.init({
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

            user_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            working_days: {
                type: DataTypes.ENUM(
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                ),
                allowNull: false,
            },

            employee_type: {
                type: DataTypes.ENUM(
                    "visiting",
                    "permanent",
                    "remote"
                ),
                allowNull: false,
            },

            location_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            start_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },

            end_time: {
                type: DataTypes.TIME,
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
            modelName: 'UserShiftSchedule',
            tableName: 'user_shift_schedules',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return UserShiftSchedule;
    }

    static associate(models) {
        UserShiftSchedule.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });

        UserShiftSchedule.belongsTo(models.User, {
            foreignKey: "user_code",
            targetKey: "user_code",
            as: "user",
            constraints: false,
        });
        UserShiftSchedule.belongsTo(models.Location, {
            foreignKey: "location_code",
            targetKey: "location_code",
            as: "location",
            constraints: false,
        });
    }
}

module.exports = UserShiftSchedule;