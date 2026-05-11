'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sessions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            user_code: {
                type: Sequelize.STRING(8),
                allowNull: false,
            },

            refresh_token: {
                type: Sequelize.STRING(512),
                allowNull: false,
                unique: true,
            },

            expires_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('sessions');
    },
};