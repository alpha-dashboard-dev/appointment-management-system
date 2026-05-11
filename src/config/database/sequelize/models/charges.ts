export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "Charge",
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

        chargeUom: {
          type: DataTypes.ENUM("FIXED", "PERCENTAGE"),
          allowNull: false,
          field: "charge_uom",
        },

        chargeValue: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: "charge_value",
        },

        chargeCode: {
          type: DataTypes.STRING(8),
          allowNull: false,
          unique: true,
          field: "charge_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },

        description: {
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
        tableName: "charges",
        timestamps: true,
        underscored: true,
      }
  );
};