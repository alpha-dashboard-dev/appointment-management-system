'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'employee_type', {
            type: Sequelize.ENUM('visiting', 'permanent', 'remote'),
            allowNull: true,
            defaultValue: 'permanent',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'employee_type');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_users_employee_type";'
        );
    },
};
