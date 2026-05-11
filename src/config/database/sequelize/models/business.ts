export default (sequelize: any, DataTypes: any) => {
    return sequelize.define(
        "Business",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            businessCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                unique: true,
                field: "business_code",
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },
            organizationCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                unique: false,
                field: "organization_code",
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
                unique: true,
            },

            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            userCode: {
                type: DataTypes.STRING(8),
                allowNull: true,
                unique: true,
                field: "user_code",
            },

            timezone: {
                type: DataTypes.STRING(100),
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
            tableName: "businesses",
            timestamps: true,
            underscored: true,
        }
    );
};