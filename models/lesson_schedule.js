'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class lesson_schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      lesson_schedule.belongsTo(models.subject, {
        foreignKey: 'fk_subject',
        as: 'subject',
      });

      // Define association with Class
      lesson_schedule.belongsTo(models.classes, {
        foreignKey: 'fk_class',
        as: 'class',
      });

      // Define association with Teacher
      lesson_schedule.belongsTo(models.teacher, {
        foreignKey: 'fk_teacher',
        as: 'teacher'
      });
    }
  }
  lesson_schedule.init({
    pk_lesson_schedule: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_subject: DataTypes.INTEGER,
    fk_class: DataTypes.INTEGER,
    fk_teacher: DataTypes.INTEGER,
    lesson_schedule_start_hour: DataTypes.BIGINT,
    lesson_schedule_end_hour: DataTypes.BIGINT,
    lesson_schedule_days: DataTypes.BIGINT,
    created_date: DataTypes.BIGINT,
    updated_date: DataTypes.BIGINT,
  }, {
    sequelize,
    modelName: 'lesson_schedule',
    timestamps: false
  });
  return lesson_schedule;
};