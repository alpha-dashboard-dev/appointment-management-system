export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "Appointment",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        business_code: {
          type: DataTypes.STRING(8),
          allowNull: false,
          field: "business_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        appointmentCode: {
          type: DataTypes.STRING(8),
          allowNull: true,
          unique: true,
          field: "appointment_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        appointmentStartDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: "appointment_start_date",
        },

        appointmentEndDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: "appointment_end_date",
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

        locationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "location_id",
        },

        status: {
          type: DataTypes.ENUM(
              "PENDING",
              "APPROVED",
              "IN_PROGRESS",
              "REJECTED",
              "COMPLETED",
              "CANCELLED",
              "RESCHEDULED"
          ),
          allowNull: false,
          defaultValue: "PENDING",
        },

        quotationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "quotation_id",
        },

          createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "created_by",
        },

        approvedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "approved_by",
        },

        cancelledBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "cancelled_by",
        },

        rescheduledFrom: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "rescheduled_from",
        },

        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
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
        tableName: "appointments",
        timestamps: true,
        underscored: true,
      }
  );
};