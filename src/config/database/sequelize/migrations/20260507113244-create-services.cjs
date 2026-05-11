'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
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

      service_code: {
        type: Sequelize.STRING(8),
        allowNull: false,
        unique: true,
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      currency: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: 'USD',
      },

      duration_uom: {
        type: Sequelize.ENUM('week', 'day', 'hour', 'minutes'),
        allowNull: true,
      },

      duration_value: {
        type: Sequelize.INTEGER,
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('services');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_services_duration_uom";'
    );
  },
};