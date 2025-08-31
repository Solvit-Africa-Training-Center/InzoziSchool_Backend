'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      { id: uuidv4(), name: 'SYSTEM_ADMIN', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'SCHOOL_INSPECTOR', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'SCHOOL_MANAGER', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'NORMAL_USER', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
