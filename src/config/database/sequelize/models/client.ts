export default (sequelize: any, DataTypes: any) => {
    return sequelize.define(
        "Client",
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

            userCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: "user_code",
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
            tableName: "clients",
            timestamps: true,
            underscored: true,
        }
    );
};