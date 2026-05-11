'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_recurrence', {
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

      recurrence_uom: {
        type: Sequelize.ENUM(
            'MONTHLY',
            'DAILY',
            'WEEKLY',
            'FORTNIGHTLY',
            'QUARTERLY',
            'FIXED'
        ),
        allowNull: false,
      },

      recurrence_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },

      auto_cancel_after_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      reschedule_after_days: {
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
    await queryInterface.dropTable('appointment_recurrence');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_appointment_recurrence_recurrence_uom";'
    );

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_appointment_recurrence_status";'
    );
  },
};