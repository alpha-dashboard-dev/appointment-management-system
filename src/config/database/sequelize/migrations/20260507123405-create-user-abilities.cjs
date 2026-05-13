'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_abilities', {
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

      user_type: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      ability: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },

      added_by: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },

      updated_by: {
        type: Sequelize.STRING(8),
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
    await queryInterface.dropTable('user_abilities');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_user_abilities_user_type";'
    );

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_user_abilities_status";'
    );
  },
};