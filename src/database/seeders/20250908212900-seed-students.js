'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert('students', [
      {
        id: uuidv4(),
        schoolId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        firstName: 'John',
        middleName: 'Doe',
        lastName: 'Smith',
        gender: 'MALE',
        DOB: '2010-05-12',
        indexNumber: 'S123456',
        studentType: 'newcomer',
        resultSlip: 'https://res.cloudinary.com/demo/image/upload/resultSlip.pdf',
        previousReport: 'https://res.cloudinary.com/demo/image/upload/report.pdf',
        mitationLetter: 'https://res.cloudinary.com/demo/image/upload/invitation.pdf',
        passportPhoto: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
        fathersNames: 'Michael Smith',
        mothersNames: 'Sarah Smith',
        representerEmail: 'parent@example.com',
        representerPhone: '+250788123456',

        nationality: 'Rwandan',
        province: 'Kigali City',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kigugu',

        status: 'pending',
        babyeyiDocument: null, // no document issued yet
        babyeyiIssuedAt: null,

        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        schoolId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        firstName: 'Amina',
        lastName: 'Kamanzi',
        gender: 'FEMALE',
        DOB: '2011-08-22',
        studentType: 'ongoing',
        passportPhoto: 'https://res.cloudinary.com/demo/image/upload/photo2.jpg',
        fathersNames: 'Jean Kamanzi',
        mothersNames: 'Claudine Uwase',
        representerEmail: 'guardian@example.com',
        representerPhone: '+250788654321',

        nationality: 'Rwandan',
        province: 'Southern',
        district: 'Huye',
        sector: 'Ngoma',
        cell: 'Tumba',
        village: 'Rango',

        status: 'approved',
        babyeyiDocument: 'https://res.cloudinary.com/demo/image/upload/babyeyi.pdf',
        babyeyiIssuedAt: now, // issued at seeding time

        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('students', null, {});
  },
};
