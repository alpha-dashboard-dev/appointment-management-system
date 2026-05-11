export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "AppointmentService",
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

        appointmentCode: {
          type: DataTypes.STRING(8),
          allowNull: true,
          field: "appointment_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
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
        tableName: "appointment_services",
        timestamps: true,
        underscored: true,
      }
  );
};