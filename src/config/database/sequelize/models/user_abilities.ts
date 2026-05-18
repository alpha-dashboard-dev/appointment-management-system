const { Model, DataTypes } = require('sequelize');

class UserAbility extends Model {
    static initModel(sequelize) {
        UserAbility.init({
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

            user_type: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            ability: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            status: {
                type: DataTypes.ENUM(
                    "active",
                    "inactive"
                ),
                allowNull: false,
                defaultValue: "active",
            },

            added_by: {
                type: DataTypes.STRING(8),
                allowNull: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            updated_by: {
                type: DataTypes.STRING(8),
                allowNull: true,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
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
            modelName: 'UserAbility',
            tableName: 'user_abilities',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
        });

        return UserAbility;
    }

    static associate(models) {
        UserAbility.belongsTo(models.Business, {
            foreignKey: "business_code",
            targetKey: "business_code",
            as: "business",
            constraints: false,
        });


        UserAbility.belongsTo(models.User, {
            foreignKey: "user_code",
            targetKey: "user_code",
            as: "user",
            constraints: false,
        });


        UserAbility.belongsTo(models.User, {
            foreignKey: "added_by",
            targetKey: "user_code",
            as: "addedByUser",
            constraints: false,
        });

        UserAbility.belongsTo(models.User, {
            foreignKey: "updated_by",
            targetKey: "user_code",
            as: "updatedByUser",
            constraints: false,
        });
    }
}

module.exports = UserAbility;