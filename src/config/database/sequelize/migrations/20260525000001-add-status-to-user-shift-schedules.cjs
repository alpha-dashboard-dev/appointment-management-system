'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_shift_schedules', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_shift_schedules', 'status');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_user_shift_schedules_status";'
    );
  },
};
