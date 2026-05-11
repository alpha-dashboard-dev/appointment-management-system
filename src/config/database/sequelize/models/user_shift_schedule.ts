export default (sequelize: any, DataTypes: any) => {
    return sequelize.define(
        "UserShiftSchedule",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            businessCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: "business_code",
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            userCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: "user_code",
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            workingDays: {
                type: DataTypes.ENUM(
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY"
                ),
                allowNull: false,
                field: "working_days",
            },
            employeeType: {
                type: DataTypes.ENUM("visiting", "permanent", "remote"),
                allowNull: false,
                field: "employee_type"
            },
            locationCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: "location_code",
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: "start_time",
            },

            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: "end_time",
            },

            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: "created_at",
            },

            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: "updated_at",
            },
        },
        {
            tableName: "user_shift_schedules",
            timestamps: true,
            underscored: true,
        }
    );
};