"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("applications", [
      {
        id: "a1b2c3d4-1234-5678-9012-abcdefabcdef",
        studentId: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("applications", null, {});
  },
};
