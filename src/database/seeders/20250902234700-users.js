'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch roles by name
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('SCHOOL_MANAGER', 'INSPECTOR')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});

    // Fetch schools by code
   const schools = await queryInterface.sequelize.query(
  `SELECT id, school_code FROM schools WHERE school_code IN ('IA001', 'DG002')`,
  { type: Sequelize.QueryTypes.SELECT }
);
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.school_code] = school.id;
      return acc;
    }, {});

    const users = [
      {
        id: uuidv4(),
        first_name: 'Alice',
        last_name: 'Mukamana',
        gender: 'Female',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788123456',
        email: 'alice@example.com',
        password: null,
        role_id: roleMap['SCHOOL_MANAGER'],
        school_id: schoolMap['IA001'],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        id: uuidv4(),
        first_name: 'Eric',
        last_name: 'Niyonzima',
        gender: 'Male',
        province: 'Eastern',
        district: 'Ngoma',
        sector: 'Kibungo',
        cell: 'Rukira',
        village: 'Gatonde',
        phone: '0788345678',
        email: 'eric@example.com',
        password: '$2b$10$hashedpasswordhere', // Replace with actual hash
        role_id: roleMap['INSPECTOR'],
        school_id: schoolMap['DG002'],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    for (const user of users) {
      try {
        const existing = await queryInterface.sequelize.query(
          `SELECT id FROM users WHERE email = '${user.email}'`,
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        if (existing.length === 0) {
          await queryInterface.bulkInsert('users', [user]);
        }
      } catch (error) {
        console.log(`User ${user.email} already exists or error:`, error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: ['alice@example.com', 'eric@example.com'],
    });
  },
};
