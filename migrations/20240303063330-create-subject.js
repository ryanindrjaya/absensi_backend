'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subjects', {
      pk_subject: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subject_name: {
        type: Sequelize.STRING
      },
      created_date: {
        type: Sequelize.BIGINT,
      },
      updated_date: {
        type: Sequelize.BIGINT,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subjects');
  }
};