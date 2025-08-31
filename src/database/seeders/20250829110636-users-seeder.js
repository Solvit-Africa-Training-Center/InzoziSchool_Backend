'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed roles first
    const roles = [
      {
        id: uuidv4(),
        name: 'SYSTEM_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'NORMAL_USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('roles', roles, { ignoreDuplicates: true });

    // Fetch SYSTEM_ADMIN role id
    const [systemAdminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM "roles" WHERE name = 'SYSTEM_ADMIN' LIMIT 1;`
    );

    const [normalUserRole] = await queryInterface.sequelize.query(
      `SELECT id FROM "roles" WHERE name = 'NORMAL_USER' LIMIT 1;`
    );

    if (!systemAdminRole.length || !normalUserRole.length) {
      throw new Error('Roles not seeded correctly.');
    }

    const systemAdminRoleId = systemAdminRole[0].id;
    const normalUserRoleId = normalUserRole[0].id;

    // Insert users
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: uuidv4(),
          fullName: 'Admin User',
          email: 'admin@example.com',
          password: 'systemAd12',
          googleId: null,
          profileImage: null,
          roleId: systemAdminRoleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          fullName: 'Normal User',
          email: 'user@example.com',
          password: await bcrypt.hash('user1234', 10),
          googleId: null,
          profileImage: null,
          roleId: normalUserRoleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'user@example.com'],
    });
    await queryInterface.bulkDelete('roles', {
      name: ['SYSTEM_ADMIN', 'NORMAL_USER'],
    });
  },
};
