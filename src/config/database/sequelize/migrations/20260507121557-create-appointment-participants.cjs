'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_participants', {
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

      user_code: {
        type: Sequelize.STRING(8),
        allowNull: false,
      },

      user_type: {
        type: Sequelize.ENUM('OWNER', 'STAFF', 'CLIENT'),
        allowNull: false,
      },

      user_role: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
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
    await queryInterface.dropTable('appointment_participants');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_appointment_participants_user_type";'
    );

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_appointment_participants_status";'
    );
  },
};