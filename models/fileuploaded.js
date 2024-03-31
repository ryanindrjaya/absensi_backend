"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class fileuploaded extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  fileuploaded.init(
    {
      case: DataTypes.STRING,
      size: DataTypes.DOUBLE,
      file_url: DataTypes.TEXT,
      filename: DataTypes.TEXT,
      original_filename: DataTypes.TEXT,
      mime_type: DataTypes.STRING,
      deleted_status: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      created_date: DataTypes.BIGINT,
      updated_date: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "fileuploaded",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return fileuploaded;
};
