'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'users',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                user_code: {
                    type: Sequelize.STRING(8),
                    allowNull: false,
                    unique: true,
                },
                business_code: {
                    type: Sequelize.STRING(8),
                    allowNull: false,
                    defaultValue: '0',
                },
                name: {
                    allowNull: false,
                    type: Sequelize.STRING(255),
                },
                email: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                    unique: true,
                },
                phone: {
                    type: Sequelize.STRING(50),
                    allowNull: false,
                    unique: true,
                },

                password: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },

                user_type: {
                    type: Sequelize.ENUM(
                        'admin',
                        'business_owner',
                        'operational_staff',
                        'service_staff',
                        'client'
                    ),
                    allowNull: false,
                },

                is_active: {
                    type: Sequelize.ENUM('active', 'inactive'),
                    allowNull: false,
                    defaultValue: 'active',
                },

                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },

                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                timestamps: true,
                underscored: true,
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_users_user_type";'
        );

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_users_is_active";'
        );
    },
};