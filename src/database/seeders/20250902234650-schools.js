'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schools = [
      {
        id: uuidv4(),
        school_name: 'Inzozi Academy',
        school_code: 'IA001',
        school_category: 'REB',
        school_level: 'O-level',
        school_combination: ['MPC', 'MCB'],
        school_type: 'Mixed',
        province: 'Eastern',
        district: 'Ngoma',
        sector: 'Kibungo',
        cell: 'Rukira',
        village: 'Gatonde',
        user_id: null,
        email: 'admin@inzozi.rw',
        telephone: '0788123456',
        images: null,
        profile: null,
        description: 'A visionary school focused on science and technology.',
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        id: uuidv4(),
        school_name: 'Dream Girls High',
        school_code: 'DG002',
        school_category: 'RTB',
        school_level: 'A-level',
        school_combination: ['HEG', 'LEG'],
        school_type: 'Girls',
        province: 'Southern',
        district: 'Huye',
        sector: 'Tumba',
        cell: 'Kigoma',
        village: 'Nyakabanda',
        user_id: null,
        email: 'contact@dreamgirls.rw',
        telephone: '0788345678',
        images: null,
        profile: null,
        description: 'Empowering young women through education.',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    for (const school of schools) {
      try {
        const existing = await queryInterface.sequelize.query(
          `SELECT id FROM schools WHERE school_code = '${school.school_code}'`,
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        if (existing.length === 0) {
          await queryInterface.bulkInsert('schools', [school]);
        }
      } catch (error) {
        console.log(`School ${school.school_code} already exists or error:`, error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('schools', {
      school_code: ['IA001', 'DG002'],
    });
  },
};
