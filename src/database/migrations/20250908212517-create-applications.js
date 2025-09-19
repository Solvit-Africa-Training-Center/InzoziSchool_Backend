"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("applications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "students",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("applications");
  },
};
