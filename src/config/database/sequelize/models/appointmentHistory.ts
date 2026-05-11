export default (sequelize: any, DataTypes: any) => {
    return sequelize.define(
        "AppointmentHistory",
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

            appointmentCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: "appointment_code",
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            action: {
                type: DataTypes.ENUM(
                    "CREATED",
                    "UPDATED",
                    "ASSIGNED",
                    "RESCHEDULED",
                    "CANCELLED",
                ),
                allowNull: false,
            },

            changedBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "changed_by",
            },

            oldValue: {
                type: DataTypes.JSON,
                allowNull: true,
                field: "old_value",
            },

            newValue: {
                type: DataTypes.JSON,
                allowNull: true,
                field: "new_value",
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
            tableName: "appointment_history",
            timestamps: true,
            underscored: true,
        }
    );
};