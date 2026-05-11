'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
        'clients',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },

          business_code: {
            type: Sequelize.STRING(8),
            allowNull: false,
          },

          user_code: {
            type: Sequelize.STRING(8),
            allowNull: false,
          },

          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },

          email: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },

          phone: {
            type: Sequelize.STRING(50),
            allowNull: false,
          },

          address: {
            type: Sequelize.TEXT,
            allowNull: true,
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
          // timestamps: true,
        }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clients');
  },
};