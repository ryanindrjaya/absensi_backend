'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      student.belongsTo(models.classes, {
        as: 'class',
        foreignKey: 'fk_class'
      });
    }
  }

  student.init({
    pk_student: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nis: DataTypes.INTEGER,
    fk_class: DataTypes.INTEGER,
    name: DataTypes.STRING,
    place_of_birth: DataTypes.STRING,
    date_of_birth: DataTypes.BIGINT,
    created_date: DataTypes.BIGINT,
    updated_date: DataTypes.BIGINT,
  }, {
    sequelize,
    modelName: 'student',
    timestamps: false
  });
  return student;
};