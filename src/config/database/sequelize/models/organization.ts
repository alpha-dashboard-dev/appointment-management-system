export default (sequelize: any, DataTypes: any) => {
    return sequelize.define(
        "Organization",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            organizationCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                unique: true,
                field: "organization_code",
                validate: {
                    is: /^[A-Za-z0-9]{8}$/,
                },
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("active", "in_active"),
                allowNull: false,
                defaultValue: "active",
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
            tableName: "organizations",
            timestamps: true,
            underscored: true,
        }
    );
};