export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "User",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        organizationCode: {
          type: DataTypes.STRING(8),
          allowNull: false,
          field: "organization_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        userCode: {
          type: DataTypes.STRING(8),
          allowNull: false,
          unique: true,
          field: "user_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        // "0" only for ADMIN
        businessCode: {
          type: DataTypes.STRING(8),
          allowNull: false,
          defaultValue: "0",
          field: "business_code",
        },

        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },

        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
          validate: {
            isEmail: true,
          },
        },

        phone: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },

        password: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        userType: {
          type: DataTypes.ENUM("ADMIN", "BUSINESS_OWNER", "OPERATIONAL_STAFF", "SERVICE_STAFF", "CLIENT"),
          allowNull: false,
          field: "user_type",
        },

        isActive: {
          type: DataTypes.ENUM("active", "inactive"),
          allowNull: false,
          defaultValue: "active",
          field: "is_active",
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
        tableName: "users",
        timestamps: true,
        underscored: true,
      }
  );
};