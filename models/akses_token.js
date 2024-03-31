"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class akses_token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  akses_token.init(
    {
      id_akses_token: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
      },
      access_token: {
        type: DataTypes.TEXT,
      },
      ip_address: {
        type: DataTypes.STRING,
      },
      last_time: {
        type: DataTypes.BIGINT,
      },
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      created_date: DataTypes.BIGINT,
      updated_date: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "akses_token",
      timestamps: false,
    }
  );
  return akses_token;
};
