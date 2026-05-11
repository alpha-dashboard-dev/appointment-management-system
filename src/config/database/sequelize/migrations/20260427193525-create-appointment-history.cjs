'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_history', {
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

      action: {
        type: Sequelize.ENUM(
            "CREATED",
            "UPDATED",
            "ASSIGNED",
            "RESCHEDULED",
            "CANCELLED",
        ),
        allowNull: false,
      },

      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      old_value: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      new_value: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('appointment_history');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_appointment_history_action";'
    );
  },
};