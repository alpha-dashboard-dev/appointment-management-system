export default (sequelize: any, DataTypes: any) => {
    return sequelize.define(
        "Session",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            userCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: "user_code",
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },

            refreshToken: {
                type: DataTypes.STRING(512),
                allowNull: false,
                unique: true,
                field: "refresh_token",
            },

            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: "expires_at",
            },

            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: "created_at",
            },
        },
        {
            tableName: "sessions",
            timestamps: false,
            underscored: true,
        }
    );
};