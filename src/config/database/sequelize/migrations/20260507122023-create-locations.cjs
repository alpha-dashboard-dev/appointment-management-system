'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      business_code: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },

      location_code: {
        type: Sequelize.STRING(8),
        allowNull: false,
        unique: true,
      },

      location_type: {
        type: Sequelize.ENUM('BUSINESS', 'CLIENT'),
        allowNull: false,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      street: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      apartment: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      city: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },

      postal_code: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },

      province: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },

      country: {
        type: Sequelize.STRING(200),
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
    await queryInterface.dropTable('locations');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_locations_location_type";'
    );
  },
};