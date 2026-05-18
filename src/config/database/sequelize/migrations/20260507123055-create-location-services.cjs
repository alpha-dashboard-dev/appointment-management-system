'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('location_services', {
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
      },

      location_code: {
        type: Sequelize.STRING(8),
        allowNull: false,
      },

      availability: {
        type: Sequelize.ENUM('available', 'not_available'),
        allowNull: false,
        defaultValue: 'available',
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
    await queryInterface.dropTable('location_services');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_location_services_availability";'
    );
  },
};