const { Model, DataTypes } = require('sequelize');

class Client extends Model {
    static initModel(sequelize) {
        Client.init({
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

            user_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },

            phone: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },

            address: {
                type: DataTypes.TEXT,
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
            modelName: 'Client',
            tableName: 'clients',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return Client;
    }

    static associate(models) {

        Client.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });


        Client.belongsTo(models.User, {
            foreignKey: "user_code",
            targetKey: "user_code",
            as: "user",
            constraints: false,
        });
    }
}

module.exports = Client;