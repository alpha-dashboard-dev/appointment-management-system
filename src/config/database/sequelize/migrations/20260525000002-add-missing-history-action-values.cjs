'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // PostgreSQL: ADD VALUE cannot run inside a transaction, so we use { transaction: null }
    const opts = { transaction: null };
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_appointment_history_action" ADD VALUE IF NOT EXISTS 'approved'`, opts
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_appointment_history_action" ADD VALUE IF NOT EXISTS 'rejected'`, opts
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_appointment_history_action" ADD VALUE IF NOT EXISTS 'completed'`, opts
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_appointment_history_action" ADD VALUE IF NOT EXISTS 'in_progress'`, opts
    );
  },

  async down(queryInterface) {
    // PostgreSQL does not support removing individual enum values.
    // To revert, recreate the type without the added values (requires table rewrite).
    // This is a no-op for safety; manual revert would be needed if required.
  },
};
