'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      schoolId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      middleName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'),
        allowNull: false,
      },
      DOB: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      indexNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      studentType: {
        type: Sequelize.ENUM('newcomer', 'ongoing'),
        allowNull: false,
      },
      resultSlip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      previousReport: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mitationLetter: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      passportPhoto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fathersNames: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mothersNames: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      representerEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      representerPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: false,
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
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },

      // ✅ Added to match model
      babyeyiDocument: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      babyeyiIssuedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('students');

    // Clean up ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_gender";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_studentType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_status";');
  },
};
