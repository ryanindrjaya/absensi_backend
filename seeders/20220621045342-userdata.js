'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "demo admin",
          email: "demoadmin@gmail.com",
          picture: "https://upload.wikimedia.org/wikipedia/commons/4/41/Profile-720.png",
          phone: "085607287537",
          password: "$2a$10$nnL2Kjay4kBhE8zel.l66OmutXizIjqshYfYxKmcSoE4Mq4dGSaIi",
          role: 1,
          created_by: 1,
          updated_by: 1,
          created_date: 1655533701200,
          updated_date: 1655533701200,
        },
        {
          name: "demo teacher",
          email: "demoteacher@gmail.com",
          picture: "https://upload.wikimedia.org/wikipedia/commons/4/41/Profile-720.png",
          phone: "085607287538",
          password: "$2a$10$nnL2Kjay4kBhE8zel.l66OmutXizIjqshYfYxKmcSoE4Mq4dGSaIi",
          role: 2,
          created_by: 1,
          updated_by: 1,
          created_date: 1655533701200,
          updated_date: 1655533701200,
        },

      ],
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("users", null, {});
  }
};
