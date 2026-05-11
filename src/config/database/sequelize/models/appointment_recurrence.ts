export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "AppointmentRecurrence",
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

        serviceCode: {
          type: DataTypes.STRING(8),
          allowNull: false,
          field: "service_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        recurrenceUom: {
          type: DataTypes.ENUM(
              "MONTHLY",
              "DAILY",
              "WEEKLY",
              "FORTNIGHTLY",
              "QUARTERLY",
              "FIXED"
          ),
          allowNull: false,
          field: "recurrence_uom",
        },

        recurrenceValue: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "recurrence_value",
        },

        status: {
          type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
          allowNull: false,
          defaultValue: "ACTIVE",
        },

        autoCancelAfterDays: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "auto_cancel_after_days",
        },

        rescheduleAfterDays: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "reschedule_after_days",
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
        tableName: "appointment_recurrence",
        timestamps: true,
        underscored: true,
      }
  );
};