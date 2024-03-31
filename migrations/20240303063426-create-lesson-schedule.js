'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_schedules', {
      pk_lesson_schedule: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fk_subject: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fk_class: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fk_teacher: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lesson_schedule_start_hour: {
        type: Sequelize.BIGINT
      },
      lesson_schedule_end_hour: {
        type: Sequelize.BIGINT
      },
      lesson_schedule_days: {
        type: Sequelize.BIGINT
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
    await queryInterface.dropTable('lesson_schedules');
  }
};