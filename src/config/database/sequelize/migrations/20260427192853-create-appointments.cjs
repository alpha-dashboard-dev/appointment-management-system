'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
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
        allowNull: true,
        unique: true,
      },

      appointment_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      appointment_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      location_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM(
            'PENDING',
            'APPROVED',
            "IN_PROGRESS",
            'REJECTED',
            'COMPLETED',
            'CANCELLED',
            'RESCHEDULED'
        ),
        allowNull: false,
        defaultValue: 'PENDING',
      },

      quotation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      cancelled_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      rescheduled_from: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      notes: {
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointments');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_appointments_status";'
    );
  },
};