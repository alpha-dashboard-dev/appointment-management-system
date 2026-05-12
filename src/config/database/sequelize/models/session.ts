const { Model, DataTypes } = require('sequelize');

class Session extends Model {
    static initModel(sequelize) {
        Session.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            userCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
                field: 'user_code',
            },

            refreshToken: {
                type: DataTypes.STRING(512),
                allowNull: false,
                unique: true,
                field: 'refresh_token',
            },

            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'expires_at',
            },

            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'created_at',
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
            foreignKey: "userCode",
            targetKey: "userCode",
            as: "user",
            constraints: false,
        });
    }
}

module.exports = Session;