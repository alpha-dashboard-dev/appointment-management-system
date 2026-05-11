export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "LocationService",
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

        locationCode: {
          type: DataTypes.STRING(8),
          allowNull: false,
          field: "location_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        availability: {
          type: DataTypes.ENUM("AVAILABLE", "NOT_AVAILABLE"),
          allowNull: false,
          defaultValue: "AVAILABLE",
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
        tableName: "location_services",
        timestamps: true,
        underscored: true,
      }
  );
};