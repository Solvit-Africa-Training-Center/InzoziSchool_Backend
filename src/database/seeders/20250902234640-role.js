'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      'SYSTEM_ADMIN',
      'SCHOOL_MANAGER', 
      'INSPECTOR',
      'ADMISSION_MANAGER'
    ];

    for (const roleName of roles) {
      const [role, created] = await queryInterface.sequelize.query(
        `INSERT INTO roles (id, name, created_at, updated_at, deleted_at) 
         VALUES ('${uuidv4()}', '${roleName}', NOW(), NOW(), NULL) 
         ON CONFLICT (name) DO UPDATE SET updated_at = NOW() 
         RETURNING *`,
        { type: Sequelize.QueryTypes.INSERT }
      ).catch(async () => {
        // If the above fails, try a simpler upsert approach
        const existing = await queryInterface.sequelize.query(
          `SELECT id FROM roles WHERE name = '${roleName}'`,
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        if (existing.length === 0) {
          return await queryInterface.sequelize.query(
            `INSERT INTO roles (id, name, created_at, updated_at, deleted_at) 
             VALUES ('${uuidv4()}', '${roleName}', NOW(), NOW(), NULL)`,
            { type: Sequelize.QueryTypes.INSERT }
          );
        }
        return existing;
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
