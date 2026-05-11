export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "Location",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        businessCode: {
          type: DataTypes.STRING(8),
          allowNull: true,
          field: "business_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        locationCode: {
          type: DataTypes.STRING(8),
          allowNull: false,
          unique: true,
          field: "location_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        locationType: {
          type: DataTypes.ENUM("BUSINESS", "CLIENT"),
          allowNull: false,
          field: "location_type",
        },

        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        street: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },

        apartment: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },

        city: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },

        postalCode: {
          type: DataTypes.STRING(200),
          allowNull: true,
          field: "postal_code",
        },

        province: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },

        country: {
          type: DataTypes.STRING(200),
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
        tableName: "locations",
        timestamps: true,
        underscored: true,
      }
  );
};