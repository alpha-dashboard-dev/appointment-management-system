'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_shift_schedules', {
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

      working_days: {
        type: Sequelize.ENUM(
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
        ),
        allowNull: false,
      },
      employee_type:{
        type: Sequelize.ENUM("visiting", "permanent", "remote"),
        allowNull: false,
      },
      location_code: {
        type: Sequelize.STRING(8),
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
    await queryInterface.dropTable('user_shift_schedules');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_user_shift_schedules_working_days";'
    );
  },
};