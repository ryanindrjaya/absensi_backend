'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      teacher.belongsTo(models.classes, {
        as: 'class',
        foreignKey: 'fk_class'
      });
      teacher.belongsToMany(models.subject, {
        through: 'teacher_subject',
        foreignKey: 'teacherId',
        otherKey: 'subjectId',
        as: 'subjects'
      });
    }
  }
  teacher.init({
    pk_teacher: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nik: DataTypes.STRING,
    fk_user: DataTypes.INTEGER,
    fk_class: DataTypes.INTEGER,
    name: DataTypes.STRING,
    created_date: DataTypes.BIGINT,
    updated_date: DataTypes.BIGINT,
  }, {
    sequelize,
    modelName: 'teacher',
    timestamps: false
  });
  return teacher;
};