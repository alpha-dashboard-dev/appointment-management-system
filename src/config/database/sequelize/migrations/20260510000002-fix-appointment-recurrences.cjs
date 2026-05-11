'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDesc = await queryInterface.describeTable('appointment_recurrences').catch(() => null);

        if (!tableDesc) return;

        const columns = {
            business_code: { type: Sequelize.STRING(8), allowNull: true },
            service_code: { type: Sequelize.STRING(8), allowNull: true },
            recurrence_uom: {
                type: Sequelize.ENUM('MONTHLY', 'DAILY', 'WEEKLY', 'FORTNIGHTLY', 'QUARTERLY', 'FIXED'),
                allowNull: true,
            },
            recurrence_value: { type: Sequelize.INTEGER, allowNull: true },
            auto_cancel_after_days: { type: Sequelize.INTEGER, allowNull: true },
            reschedule_after_days: { type: Sequelize.INTEGER, allowNull: true },
        };

        for (const [col, def] of Object.entries(columns)) {
            if (!tableDesc[col]) {
                await queryInterface.addColumn('appointment_recurrences', col, def);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        const cols = ['business_code', 'service_code', 'recurrence_uom', 'recurrence_value', 'auto_cancel_after_days', 'reschedule_after_days'];
        for (const col of cols) {
            await queryInterface.removeColumn('appointment_recurrences', col).catch(() => {});
        }
    },
};
