export default (sequelize: any, DataTypes: any) => {
  return sequelize.define(
      "Invoice",
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

        subtotal: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },

        total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },

        status: {
          type: DataTypes.ENUM("DRAFT", "ISSUED", "PAID", "CANCELLED"),
          allowNull: false,
          defaultValue: "DRAFT",
          field: "invoice_status",
        },

        date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },

        updatedBy: {
          type: DataTypes.STRING(8),
          allowNull: true,
          field: "updated_by",
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
        tableName: "invoices",
        timestamps: true,
        underscored: true,
      }
  );
};