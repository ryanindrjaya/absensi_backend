"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("fileuploaded", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      case: {
        type: Sequelize.STRING,
      },
      size: {
        type: Sequelize.DOUBLE,
      },
      file_url: {
        type: Sequelize.TEXT,
      },
      filename: {
        type: Sequelize.TEXT,
      },
      original_filename: {
        type: Sequelize.TEXT,
      },
      mime_type: {
        type: Sequelize.STRING,
      },
      deleted_status: {
        type: Sequelize.INTEGER,
      },
      created_by: {
        type: Sequelize.INTEGER,
      },
      updated_by: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("fileuploaded");
  },
};
