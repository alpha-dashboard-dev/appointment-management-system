export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "AppointmentDiscount",
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
          allowNull: false,
          field: "appointment_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        discountUom: {
          type: DataTypes.ENUM("PERCENTAGE", "FIXED"),
          allowNull: false,
          field: "discount_uom",
        },

        discountValue: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "discount_value",
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
        tableName: "appointment_discounts",
        timestamps: true,
        underscored: true,
      }
  );
};