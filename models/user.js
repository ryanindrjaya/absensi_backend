"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init(
    {
      name: DataTypes.STRING,
      picture: DataTypes.STRING,
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      created_date: DataTypes.BIGINT,
      updated_date: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "user",
      timestamps: false,
    }
  );
  return user;
};
