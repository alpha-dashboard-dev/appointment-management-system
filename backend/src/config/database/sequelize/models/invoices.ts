const { Model, DataTypes } = require('sequelize');

class Invoice extends Model {
    static initModel(sequelize) {
        Invoice.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            business_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            appointment_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
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

            invoice_status: {
                type: DataTypes.ENUM(
                    "draft",
                    "issued",
                    "paid",
                    "canceled",
                ),
                allowNull: false,
                defaultValue: "draft",
            },

            date: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            updated_by: {
                type: DataTypes.STRING(8),
                allowNull: true,
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },

            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize,
            modelName: 'Invoice',
            tableName: 'invoices',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return Invoice;
    }

    static associate(models) {
        Invoice.belongsTo(models.Appointment, {
            foreignKey: "appointment_code",
            targetKey: "appointment_code",
            as: "appointment",
            constraints: false,
        });

        Invoice.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });

        Invoice.belongsTo(models.User, {
            foreignKey: "updated_by",
            targetKey: "user_code",
            as: "updatedByUser",
            constraints: false,
        });
    }
}

module.exports = Invoice;