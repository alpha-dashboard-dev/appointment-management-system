'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('appointment_charges', 'charge_type', {
            type: Sequelize.ENUM('charge', 'discount'),
            allowNull: true,
            defaultValue: 'charge',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('appointment_charges', 'charge_type');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_appointment_charges_charge_type";'
        );
    },
};
