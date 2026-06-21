'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
        'businesses',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },

          business_code: {
            type: Sequelize.STRING(8),
            allowNull: false,
            unique: true,
          },
           organization_code: {
            type: Sequelize.STRING(8),
            allowNull: false,
            unique: false,
          },

          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },

          email: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },

          phone: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
          },

          address: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
            status: {
              type: Sequelize.ENUM("active", "inactive"),
                allowNull: false,
            },

          user_code: {
            type: Sequelize.STRING(8),
            allowNull: true,
            unique: true,
          },

          timezone: {
            type: Sequelize.STRING(100),
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
        },
        {
          // timestamps: false,
        }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('businesses');
  },
};