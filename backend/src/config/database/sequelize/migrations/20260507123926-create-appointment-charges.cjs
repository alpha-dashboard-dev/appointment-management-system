'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_charges', {
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

      appointment_code: {
        type: Sequelize.STRING(8),
        allowNull: false,
      },

      charge_code: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },

      charge_uom: {
        type: Sequelize.ENUM("fixed", "percentage"),
        allowNull: true,
      },

      charge_value: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable('appointment_charges');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_appointment_charges_charge_value";'
    );
  },
};