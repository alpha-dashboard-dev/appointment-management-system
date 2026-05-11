export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "AppointmentCharge",
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

        chargeId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "charge_id",
        },

        chargeUom: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "charge_uom",
        },

        chargeValue: {
          type: DataTypes.ENUM("GST"),
          allowNull: true,
          field: "charge_value",
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
        tableName: "appointment_charges",
        timestamps: true,
        underscored: true,
      }
  );
};