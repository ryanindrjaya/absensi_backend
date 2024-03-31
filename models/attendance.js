'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Define association with Student
      attendance.belongsTo(models.student, {
        foreignKey: 'fk_student',
        as: 'student',
      });

      attendance.belongsTo(models.teacher, {
        foreignKey: 'fk_teacher',
        as: 'teacher',
      });


      // Define association with LessonSchedule
      attendance.belongsTo(models.lesson_schedule, {
        foreignKey: 'fk_lesson',
        as: 'lesson'
      });
    }
  }
  attendance.init({
    pk_attendance: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_student: DataTypes.INTEGER,
    fk_teacher: DataTypes.INTEGER,
    fk_lesson: DataTypes.INTEGER,
    date: DataTypes.STRING,
    status: DataTypes.TEXT,
    created_date: DataTypes.BIGINT,
    updated_date: DataTypes.BIGINT,
  }, {
    sequelize,
    modelName: 'attendance',
    timestamps: false
  });
  return attendance;
};