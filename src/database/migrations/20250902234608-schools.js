'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schools', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      school_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      school_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      school_category: {
        type: Sequelize.ENUM('REB', 'RTB'),
        allowNull: false,
        defaultValue: 'REB',
      },
      school_level: {
        type: Sequelize.ENUM('Nursary', 'Primary', 'O-level', 'A-level'),
        allowNull: false,
      },
      school_combination: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      school_type: {
        type: Sequelize.ENUM('Girls', 'Boys', 'Mixed'),
        allowNull: false,
        defaultValue: 'Mixed',
      },
      province: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cell: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      village: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true, // ✅ no foreign key constraint
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      telephone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      images: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved'),
        allowNull: false,
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schools');
  },
};
