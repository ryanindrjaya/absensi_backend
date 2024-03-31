const Joi = require("joi");
const response = require("../response");
const { student, classes, attendance } = require("../models");
const xlsx = require("xlsx");
const { Op } = require("sequelize");

exports.newStudents = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().max(25).required().messages({
      "any.required": `"name" tidak boleh dikosongi`,
    }),
    fk_class: Joi.number().required().messages({
      "any.required": `"Kelas" tidak boleh dikosongi`,
    }),
    place_of_birth: Joi.string().required().messages({
      "any.required": `"Tempat lahir" tidak boleh dikosongi`,
    }),
    date_of_birth: Joi.number().required().messages({
      "any.required": `"Tanggal lahir" tidak boleh dikosongi`,
      "date.iso": `"Tanggal lahir" harus dalam format tanggal ISO`,
    }),
    nis: Joi.number().required().messages({
      "any.required": `"NIS" tidak boleh dikosongi`,
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const { fk_class, name, place_of_birth, date_of_birth, nis } = req.body;

  try {
    // Check if the NIS already exists
    const existingStudent = await student.findOne({ where: { nis: nis } });
    if (existingStudent) {
      return response.errorParams(`Siswa dengan NIS "${nis}" sudah ada`, res);
    }

    const newStudent = await student.create({
      fk_class: fk_class,
      name: name,
      place_of_birth: place_of_birth,
      date_of_birth: date_of_birth,
      nis: nis,
      created_date: Date.now(),
      updated_date: Date.now(),
    });

    response.successWithCustomMsg(`Berhasil membuat siswa`, newStudent, res);
  } catch (error) {
    response.internalServerError(error, res);
  }
};

exports.newStudentsImport = async (req, res) => {
  try {
    if (!req.files) {
      return response.notFound("Files not found", res);
    }

    const file = req.files.file;
    const workbook = xlsx.read(file.data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const studentsData = xlsx.utils.sheet_to_json(sheet);

    for (const studentData of studentsData) {
      const existingStudent = await student.findOne({
        where: { nis: studentData.nis },
      });
      if (existingStudent) {
        return response.errorParams(`Siswa dengan NIS "${studentData.nis}" sudah ada`, res);
      }

      const className = studentData.kelas;
      const foundClass = await classes.findOne({
        where: { class_name: { [Op.like]: `%${className}%` } },
      });

      if (!foundClass) {
        return response.errorParams(`Kelas dengan nama yang sejalan dengan "${className}" tidak ditemukan`, res);
      }

      await student.create({
        name: studentData.nama,
        fk_class: foundClass.pk_class,
        place_of_birth: studentData.tempat_lahir,
        date_of_birth: new Date(studentData.tanggal_lahir).getTime(),
        nis: studentData.nis,
        created_date: new Date(),
        updated_date: new Date(),
      });
    }

    return response.success("Berhasil membuat siswa dari file Excel", res);
  } catch (error) {
    console.error(error);
    return response.internalServerError(error, res);
  }
};

exports.editStudent = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().max(25).required().messages({
      "any.required": `"name" tidak boleh dikosongi`,
    }),
    fk_class: Joi.number().required().messages({
      "any.required": `"Kelas" tidak boleh dikosongi`,
    }),
    place_of_birth: Joi.string().required().messages({
      "any.required": `"Tempat lahir" tidak boleh dikosongi`,
    }),
    date_of_birth: Joi.number().required().messages({
      "any.required": `"Tanggal lahir" tidak boleh dikosongi`,
      "date.iso": `"Tanggal lahir" harus dalam format tanggal ISO`,
    }),
    nis: Joi.number().required().messages({
      "any.required": `"NIS" tidak boleh dikosongi`,
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const { fk_class, name, place_of_birth, date_of_birth, nis } = req.body;
  const studentId = req.params.id;

  try {
    const existingStudent = await student.findByPk(studentId);
    if (!existingStudent) {
      return response.notFound("Siswa tidak ditemukan", res);
    }

    // Check if the NIS already exists for another student
    const otherStudentWithSameNIS = await student.findOne({
      where: { nis: nis, pk_student: { [Op.not]: studentId } },
    });
    if (otherStudentWithSameNIS) {
      return response.errorParams(`Siswa dengan NIS "${nis}" sudah ada`, res);
    }

    await existingStudent.update({
      fk_class: fk_class,
      name: name,
      place_of_birth: place_of_birth,
      date_of_birth: date_of_birth,
      nis: nis,
      updated_date: Date.now(),
    });

    response.successWithCustomMsg(`Berhasil mengedit siswa`, existingStudent, res);
  } catch (error) {
    response.internalServerError(error, res);
  }
};

exports.deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  try {
    const deletedRows = await student.destroy({
      where: { pk_student: studentId },
    });

    if (deletedRows === 0) {
      return response.notFound("Siswa tidak ditemukan", res);
    }

    response.successWithCustomMsg(`Berhasil menghapus siswa`, {}, res);
  } catch (error) {
    console.log(error);
    response.internalServerError(error, res);
  }
};

exports.getStudent = async (req, res) => {
  await student
    .findAll({
      order: [["created_date", "DESC"]],
      include: [
        {
          model: classes,
          as: "class",
        },
      ],
      raw: true,
    })
    .then(async (results) => {
      const transformedResults = results.map((result) => ({
        pk_student: result.pk_student,
        name: result.name,
        nis: result.nis,
        place_of_birth: result.place_of_birth,
        date_of_birth: result.date_of_birth,
        kelas: result["class.class_name"],
        idKelas: result["class.pk_class"],
      }));
      return response.success(transformedResults, res);
    })
    .catch((error) => {
      return response.internalServerError(error, res);
    });
};

exports.getStudentByClassId = async (req, res) => {
  console.log("params", req.params);
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Mengatur waktu ke awal hari ini

    const results = await student.findAll({
      where: {
        fk_class: req.params.class_id,
      },
      // order: [["created_date", "DESC"]],
      include: [
        {
          model: classes,
          as: "class",
          // attributes: ['class_name'],
        },
      ],
      raw: true,
    });
    const transformedResults = await Promise.all(
      results.map(async (result) => {
        const studentAttendance = await attendance.findAll({
          where: {
            fk_student: result.pk_student,
            fk_lesson: req.params.fk_lesson,
          },
          raw: true,
        });

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

        const startOfDayUnixTimestamp = getStartOfDayUnixTimestamp();
        const endOfDayUnixTimestamp = getEndOfDayUnixTimestamp();

        const todayAttendance = studentAttendance.filter((attendance) => {
          const attendanceTimestamp = parseInt(attendance.date);
          return attendanceTimestamp >= startOfDayUnixTimestamp && attendanceTimestamp <= endOfDayUnixTimestamp;
        });

        let hasAttended = false;
        let status = "";
        let description = "";
        if (todayAttendance[todayAttendance.length - 1]?.status?.length > 0) {
          const todayData = todayAttendance[todayAttendance.length - 1];

          hasAttended = true;
          status = todayData.status;
          description = todayData.description;
        }

        return {
          name: result.name,
          idStudent: result.pk_student,
          place_of_birth: result.place_of_birth,
          date_of_birth: result.date_of_birth,
          kelas: result["class.class_name"],
          idKelas: result.fk_class,
          hasAttended: hasAttended,
          status: status,
          description: description,
        };
      })
    );

    return response.success(transformedResults, res);
  } catch (error) {
    console.log(error);
    return response.internalServerError(error, res);
  }
};
