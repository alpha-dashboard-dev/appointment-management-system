const { Model, DataTypes } = require('sequelize');

class Session extends Model {
    static initModel(sequelize) {
        Session.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            user_code: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            refresh_token: {
                type: DataTypes.STRING(512),
                allowNull: false,
                unique: true,
            },

            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize,
            modelName: 'Session',
            tableName: 'sessions',
            timestamps: false,
            underscored: true,
        });

        return Session;
    }

    static associate(models) {
        Session.belongsTo(models.User, {
            foreignKey: "user_code",
            targetKey: "user_code",
            as: "user",
            constraints: false,
        });
    }
}

module.exports = Session;