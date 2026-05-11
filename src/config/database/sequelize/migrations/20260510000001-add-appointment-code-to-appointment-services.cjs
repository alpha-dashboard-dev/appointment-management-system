'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('appointment_services', 'appointment_code', {
            type: Sequelize.STRING(8),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('appointment_services', 'appointment_code');
    },
};
