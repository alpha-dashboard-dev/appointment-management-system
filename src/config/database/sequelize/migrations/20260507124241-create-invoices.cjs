'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
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

      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      invoice_status: {
        type: Sequelize.ENUM('draft', 'issued', 'paid', 'canceled'),
        allowNull: false,
        defaultValue: 'draft',
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      updated_by: {
        type: Sequelize.STRING(8),
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
    await queryInterface.dropTable('invoices');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_invoices_invoice_status";'
    );
  },
};