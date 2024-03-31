'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      pk_attendance: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fk_student: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fk_teacher: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fk_lesson: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      created_date: {
        type: Sequelize.BIGINT
      },
      updated_date: {
        type: Sequelize.BIGINT
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attendances');
  }
};