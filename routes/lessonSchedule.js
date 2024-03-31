const Joi = require("joi");
const response = require("../response");
const { lesson_schedule, teacher, classes, subject, attendance } = require("../models");
const { formater } = require("../config/formatter");

exports.createLessonSchedule = async (req, res) => {
  const schema = Joi.object({
    fk_subject: Joi.number().required().messages({
      "any.required": `"fk_subject" tidak boleh dikosongi`,
    }),
    fk_class: Joi.number().required().messages({
      "any.required": `"fk_class" tidak boleh dikosongi`,
    }),
    fk_teacher: Joi.number().required().messages({
      "any.required": `"fk_teacher" tidak boleh dikosongi`,
    }),
    lesson_schedule_start_hour: Joi.number().required(),
    lesson_schedule_end_hour: Joi.number().required(),
    lesson_schedule_days: Joi.array().items(Joi.number().valid(0, 1, 2, 3, 4, 5, 6)).required().messages({
      "any.required": `"lesson_schedule_days" tidak boleh dikosongi`,
      "array.items": `"lesson_schedule_days" harus berisi angka yang mewakili hari dalam seminggu`,
      "any.only": `"lesson_schedule_days" harus berisi angka antara 0 dan 6 (Minggu hingga Sabtu)`,
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const {
    fk_subject,
    fk_class,
    fk_teacher,
    lesson_schedule_start_hour,
    lesson_schedule_end_hour,
    lesson_schedule_days,
  } = req.body;

  try {
    const newLessonSchedule = await lesson_schedule.create(
      {
        fk_subject: fk_subject,
        fk_class: fk_class,
        fk_teacher: fk_teacher,
        lesson_schedule_start_hour: lesson_schedule_start_hour,
        lesson_schedule_end_hour: lesson_schedule_end_hour,
        lesson_schedule_days: lesson_schedule_days,
        created_date: Date.now(),
        updated_date: Date.now(),
      },
      { raw: true }
    );

    response.successWithCustomMsg(`Berhasil membuat jadwal pelajaran`, newLessonSchedule, res);
  } catch (error) {
    response.internalServerError(error, res);
  }
};

exports.editLessonSchedule = async (req, res) => {
  const schema = Joi.object({
    fk_subject: Joi.number().required().messages({
      "any.required": `"fk_subject" tidak boleh dikosongi`,
    }),
    fk_class: Joi.number().required().messages({
      "any.required": `"fk_class" tidak boleh dikosongi`,
    }),
    fk_teacher: Joi.number().required().messages({
      "any.required": `"fk_teacher" tidak boleh dikosongi`,
    }),
    lesson_schedule_start_hour: Joi.number().required(),
    lesson_schedule_end_hour: Joi.number().required(),
    lesson_schedule_days: Joi.array().items(Joi.number().valid(0, 1, 2, 3, 4, 5, 6)).required().messages({
      "any.required": `"lesson_schedule_days" tidak boleh dikosongi`,
      "array.items": `"lesson_schedule_days" harus berisi angka yang mewakili hari dalam seminggu`,
      "any.only": `"lesson_schedule_days" harus berisi angka antara 0 dan 6 (Minggu hingga Sabtu)`,
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const {
    fk_subject,
    fk_class,
    fk_teacher,
    lesson_schedule_start_hour,
    lesson_schedule_end_hour,
    lesson_schedule_days,
  } = req.body;

  try {
    const updatedLessonSchedule = await lesson_schedule.update(
      {
        fk_subject: fk_subject,
        fk_class: fk_class,
        fk_teacher: fk_teacher,
        lesson_schedule_start_hour: lesson_schedule_start_hour,
        lesson_schedule_end_hour: lesson_schedule_end_hour,
        lesson_schedule_days: lesson_schedule_days,
        updated_date: Date.now(),
      },
      {
        where: {
          pk_lesson_schedule: req.params.id,
        },
        returning: true,
        plain: true,
      }
    );

    if (!updatedLessonSchedule) {
      return response.errorNotFound("Jadwal pelajaran tidak ditemukan", res);
    }

    response.successWithCustomMsg(`Berhasil mengedit jadwal pelajaran`, updatedLessonSchedule, res);
  } catch (error) {
    response.internalServerError(error, res);
    console.log(error);
  }
};

exports.deleteLessonSchedule = async (req, res) => {
  try {
    const deletedRows = await lesson_schedule.destroy({
      where: {
        pk_lesson_schedule: req.params.id,
      },
    });

    if (deletedRows === 0) {
      return response.errorNotFound("Jadwal pelajaran tidak ditemukan", res);
    }

    response.successWithCustomMsg(`Berhasil menghapus jadwal pelajaran`, {}, res);
  } catch (error) {
    response.internalServerError(error, res);
  }
};

exports.getLessonSchedules = async (req, res) => {
  await await lesson_schedule
    .findAll({
      // where: { user_id: loggedInUserId },
      order: [["created_date", "DESC"]],
      include: [
        {
          model: classes,
          as: "class",
          // attributes: ['class_name'],
        },
        {
          model: teacher,
          as: "teacher",
          // attributes: ['name', 'fk_user'],
        },
        {
          model: subject,
          as: "subject",
          // attributes: ['subject_name'],
        },
      ],

      raw: true,
    })
    .then((results) => {
      const transformedResults = results.reduce((acc, result) => {
        const startDate = new Date(parseInt(result.lesson_schedule_start_hour));
        const endDate = new Date(parseInt(result.lesson_schedule_end_hour));

        const startHours = startDate.getHours().toString().padStart(2, "0");
        const startMinutes = startDate.getMinutes().toString().padStart(2, "0");

        const endHours = endDate.getHours().toString().padStart(2, "0");
        const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

        const startTimeFormatted = `${startHours}:${startMinutes}`;
        const endTimeFormatted = `${endHours}:${endMinutes}`;

        const lessonStart = startDate.getHours() * 60 + startDate.getMinutes();
        const lessonEnd = endDate.getHours() * 60 + endDate.getMinutes();
        const lessonDurationMinutes = lessonEnd - lessonStart;

        const sameTeacherClassSubjectIndex = acc.findIndex(
          (item) =>
            item["teacherId"] === result["teacher.fk_user"] &&
            item["classId"] === result["class.pk_class"] &&
            item["subjectId"] === result["subject.pk_subject"]
        );

        if (sameTeacherClassSubjectIndex !== -1) {
          acc[sameTeacherClassSubjectIndex].schedules.push({
            id: result.pk_lesson_schedule,
            lessonName: result["subject.subject_name"],
            lessonTime: `${formater.convertIndexToDayName(
              result.lesson_schedule_days
            )}, ${startTimeFormatted} - ${endTimeFormatted}`,
            dayId: result.lesson_schedule_3days,
            lessonDurationMinutes: lessonDurationMinutes,
            class: result["class.class_name"],
            teacherName: result["teacher.name"],
            startLesson: result.lesson_schedule_start_hour,
            endLesson: result.lesson_schedule_end_hour,
          });
        } else {
          acc.push({
            teacherId: result["teacher.fk_user"],
            classId: result["class.pk_class"],
            subjectId: result["subject.pk_subject"],
            teacherName: result["teacher.name"],
            className: result["class.class_name"],
            subjectName: result["subject.subject_name"],
            schedules: [
              {
                id: result.pk_lesson_schedule,
                lessonName: result["subject.subject_name"],
                lessonTime: `${formater.convertIndexToDayName(
                  result.lesson_schedule_days
                )}, ${startTimeFormatted} - ${endTimeFormatted}`,
                dayId: result.lesson_schedule_3days,
                lessonDurationMinutes: lessonDurationMinutes,
                class: result["class.class_name"],
                teacherName: result["teacher.name"],
                startLesson: result.lesson_schedule_start_hour,
                endLesson: result.lesson_schedule_end_hour,
              },
            ],
          });
        }

        // get log attedance
        return acc;
      }, []);
      response.success(transformedResults, res);
    })
    .catch((error) => {
      return response.internalServerError(error, res);
    });
};

exports.getLessonSchedulesByUserId = async (req, res) => {
  function getStartOfDayUnixTimestamp() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }

  function getEndOfDayUnixTimestamp() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today.getTime();
  }

  const loggedInUserId = req.auth.id;
  try {
    const teacherData = await teacher.findOne({
      where: { fk_user: loggedInUserId },
      attributes: ["pk_teacher"],
    });

    if (!teacherData) {
      return response.notFound("Teacher not found for the logged-in user", res);
    }

    const teacherId = teacherData.pk_teacher;
    const results = await lesson_schedule.findAll({
      where: { fk_teacher: teacherId },
      order: [["created_date", "DESC"]],
      include: [
        {
          model: classes,
          as: "class",
          // attributes: ['class_name'],
        },
        {
          model: teacher,
          as: "teacher",
          // attributes: ['name', 'fk_user'],
        },
        {
          model: subject,
          as: "subject",
          // attributes: ['subject_name'],
        },
      ],
      raw: true,
    });

    const transformedResults = await Promise.all(
      results.map(async (result) => {
        const startDate = new Date(parseInt(result.lesson_schedule_start_hour));
        const endDate = new Date(parseInt(result.lesson_schedule_end_hour));

        const startHours = startDate.getHours().toString().padStart(2, "0");
        const startMinutes = startDate.getMinutes().toString().padStart(2, "0");

        const endHours = endDate.getHours().toString().padStart(2, "0");
        const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

        const startTimeFormatted = `${startHours}:${startMinutes}`;
        const endTimeFormatted = `${endHours}:${endMinutes}`;

        const lessonStart = startDate.getHours() * 60 + startDate.getMinutes();
        const lessonEnd = endDate.getHours() * 60 + endDate.getMinutes();
        const lessonDurationMinutes = lessonEnd - lessonStart;

        const isAlreadyLoggedIn = result["teacher.fk_user"] === loggedInUserId;

        const attendanceData = await attendance.findAll({
          where: {
            fk_teacher: teacherId,
            fk_lesson: result.pk_lesson_schedule,
          },
          raw: true,
        });

        const startOfDayUnixTimestamp = getStartOfDayUnixTimestamp();
        const endOfDayUnixTimestamp = getEndOfDayUnixTimestamp();

        const todayAttendance = attendanceData.filter((attendance) => {
          const attendanceTimestamp = parseInt(attendance.date);
          return attendanceTimestamp >= startOfDayUnixTimestamp && attendanceTimestamp <= endOfDayUnixTimestamp;
        });

        console.log("today attendance", todayAttendance);
        const hasAttended = todayAttendance[todayAttendance.length - 1]?.status?.length > 0;

        return {
          id: result.pk_lesson_schedule,
          lessonName: result["subject.subject_name"],
          lessonTime: `${formater.convertIndexToDayName(
            result.lesson_schedule_days
          )}, ${startTimeFormatted} - ${endTimeFormatted}`,
          lessonDurationMinutes: lessonDurationMinutes,
          lessonId: result.pk_lesson_schedule,
          class: result["class.class_name"],
          classId: result["class.pk_class"],
          teacherName: result["teacher.name"],
          teacherId: result["teacher.pk_teacher"],
          teacherAttended: hasAttended,
          isAlreadyLoggedIn: isAlreadyLoggedIn,
        };
      })
    );

    // const transformedResults = results.map(result => ({
    //     lessonName: result['subject.subject_name'],
    //     lessonTime: result.lesson_schedule,
    //     lessonId: result.pk_lesson_schedule,
    //     class: result['class.class_name'],
    //     classId: result['class.pk_class'],
    //     teacherName: result['teacher.name'],
    //     teacherId: result['teacher.pk_teacher']
    // }));
    response.success(transformedResults, res);
  } catch (error) {
    console.log(error);
    return response.internalServerError(error, res);
  }
};
