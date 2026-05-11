export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "UserAbility",
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

        userId: {
          type: DataTypes.STRING(8),
          allowNull: false,
          field: "user_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        userType: {
          type: DataTypes.ENUM("ADMIN", "BUSINESS_OWNER", "STAFF", "CLIENT"),
          allowNull: false,
          field: "user_type",
        },

        ability: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },

        status: {
          type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
          allowNull: false,
          defaultValue: "ACTIVE",
        },

        addedBy: {
          type: DataTypes.STRING(8),
          allowNull: true,
          field: "added_by",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        updatedBy: {
          type: DataTypes.STRING(8),
          allowNull: true,
          field: "updated_by",
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
        tableName: "user_abilities",
        timestamps: true,
        underscored: true,
      }
  );
};