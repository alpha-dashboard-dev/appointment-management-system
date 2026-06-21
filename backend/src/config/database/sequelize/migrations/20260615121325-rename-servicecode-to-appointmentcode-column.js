'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn(
        'appointment_recurrence',
        'service_code',
        'appointment_code'
    );
  },

  async down(queryInterface) {
    await queryInterface.renameColumn(
        'appointment_recurrence',
        'service_code',
        'appointment_code'
    );
  },
};