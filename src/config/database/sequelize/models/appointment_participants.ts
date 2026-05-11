export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "AppointmentParticipant",
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

        userId: {
          type: DataTypes.STRING(8),
          allowNull: false,
          field: "user_code",
          validate: {
            is: /^[A-Za-z0-9]{8}$/,
          },
        },

        userType: {
          type: DataTypes.ENUM("OWNER", "STAFF", "CLIENT"),
          allowNull: false,
          field: "user_type",
        },

        userRole: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: "user_role",
        },

        status: {
          type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
          allowNull: false,
          defaultValue: "ACTIVE",
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
        tableName: "appointment_participants",
        timestamps: true,
        underscored: true,
      }
  );
};