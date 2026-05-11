export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "Service",
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
          unique: true,
          field: "service_code",
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

        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },

        cost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },

        currency: {
          type: DataTypes.STRING(10),
          allowNull: true,
          defaultValue: "USD",
        },

        durationUom: {
          type: DataTypes.ENUM("week", "day", "hour", "minutes"),
          allowNull: true,
          field: "duration_uom",
        },

        durationValue: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "duration_value",
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
        tableName: "services",
        timestamps: true,
        underscored: true,
      }
  );
};