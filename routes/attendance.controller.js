const Joi = require("joi");
const response = require("../response");
const { attendance, student, teacher, lesson_schedule } = require("../models");
const { formater } = require("../config/formatter");

exports.createAttendance = async (req, res) => {
  const schema = Joi.object({
    user_role: Joi.string().valid("student", "teacher").required().messages({
      "any.required": `"user_role" tidak boleh dikosongi`,
      "any.only": `"user_role" harus 'student' atau 'teacher'`,
    }),
    fk_student: Joi.number().when("user_role", {
      is: "student",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    fk_teacher: Joi.number().when("user_role", {
      is: "teacher",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    fk_lesson: Joi.number().required().messages({
      "any.required": `"fk_lesson" tidak boleh dikosongi`,
    }),
    status: Joi.string()
      .valid("present", "absent", "permit")
      .required()
      .messages({
        "any.required": `"status" tidak boleh dikosongi`,
        "any.only": `"status" harus berisi 'present' atau 'absent'`,
      }),
    created_by: Joi.number(),
    updated_by: Joi.number(),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const { user_role, fk_student, fk_teacher, fk_lesson, status } = req.body;

  try {
    const lessonSchedule = await lesson_schedule.findByPk(fk_lesson);
    if (!lessonSchedule) {
      return response.notFound("Jadwal pelajaran tidak ditemukan", res);
    }

    const lessonStartTime = new Date(lessonSchedule.lesson_schedule_start_hour);
    const lessonEndTime = new Date(lessonSchedule.lesson_schedule_end_hour);
    const lessonScheduleDay = lessonSchedule.lesson_schedule_days;

    const currentDay = new Date().getDay();
    const currentTime = new Date();

    let newAttendance;
    const attendanceData = {
      fk_lesson: fk_lesson,
      date: Date.now(),
      status: status,
      created_date: Date.now(),
      updated_date: Date.now(),
    };

    if (user_role === "student") {
      attendanceData.fk_student = fk_student;
      newAttendance = await attendance.create(attendanceData, { raw: true });
    } else if (user_role === "teacher") {
      attendanceData.fk_teacher = fk_teacher;
      newAttendance = await attendance.create(attendanceData, { raw: true });
    }

    return response.successWithCustomMsg(
      `Berhasil membuat kehadiran`,
      newAttendance,
      res
    );

    // if (currentDay !== lessonScheduleDay) {
    //   return response.errorParams("Hari ini bukan hari jadwal pelajaran", res);
    // }

    // if (currentTime < lessonStartTime || currentTime > lessonEndTime) {
    //   //waktu kurang dari atau lebih dari
    //   return response.errorParams("Belum waktunya absensi", res);
    // } else if (currentTime - lessonStartTime > 15 * 60 * 1000) {
    //   // Terlambat lebih dari 15 menit
    //   return response.errorParams("Anda terlambat absen", res);
    // } else {
    //   let newAttendance;
    //   const attendanceData = {
    //     fk_lesson: fk_lesson,
    //     date: Date.now(),
    //     status: status,
    //     created_date: Date.now(),
    //     updated_date: Date.now(),
    //   };

    //   if (user_role === "student") {
    //     attendanceData.fk_student = fk_student;
    //     newAttendance = await attendance.create(attendanceData, { raw: true });
    //   } else if (user_role === "teacher") {
    //     attendanceData.fk_teacher = fk_teacher;
    //     newAttendance = await attendance.create(attendanceData, { raw: true });
    //   }

    //   return response.successWithCustomMsg(
    //     `Berhasil membuat kehadiran`,
    //     newAttendance,
    //     res
    //   );
    // }
  } catch (error) {
    console.error("err ", error);
    response.internalServerError(error, res);
  }
};

exports.getAttendances = async (req, res) => {
  try {
    await attendance
      .findAll({
        order: [["created_date", "DESC"]],
        include: [
          {
            model: student,
            as: "student",
          },
          {
            model: teacher,
            as: "teacher",
          },
          {
            model: lesson_schedule,
            as: "lesson",
          },
        ],
        raw: true,
      })
      .then((results) => {
        console.log(results);
        const transformedResults = results.map((result) => ({
          name: result["student.name"] ?? result["teacher.name"],
          status: result.status,
          date: formater.formatDate(parseInt(result.date)),
        }));
        response.success(transformedResults, res);
      });
  } catch (error) {
    console.log(error);
    response.internalServerError(error, res);
  }
};
