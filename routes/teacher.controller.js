const Joi = require("joi");
const response = require("../response");
const {
  teacher,
  subject,
  classes,
  teacher_subject,
  user,
} = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

exports.newTeacher = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().max(25).required().messages({
      "any.required": `"name" tidak boleh dikosongi`,
    }),
    fk_class: Joi.number().required().messages({
      "any.required": `"Kelas" tidak boleh dikosongi`,
    }),
    fk_subjects: Joi.array().items(Joi.number()).required().messages({
      "any.required": `"Mata pelajaran" tidak boleh dikosongi`,
    }),
    email: Joi.string().email().required().messages({
      "any.required": `"email" tidak boleh dikosongi`,
      "string.email": `"email" harus dalam format yang valid`,
    }),
    password: Joi.string().min(6).required().messages({
      "any.required": `"password" tidak boleh dikosongi`,
      "string.min": `"password" harus memiliki setidaknya 6 karakter`,
    }),
    nik: Joi.number().required().messages({
      "any.required": `"NIK" tidak boleh dikosongi`,
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const { name, fk_class, fk_subjects, email, password, nik } = req.body;

  try {
    const existingTeacher = await teacher.findOne({ where: { nik } });
    if (existingTeacher) {
      return response.errorParams(
        `NIK '${nik}' sudah terdaftar. Harap gunakan NIK yang berbeda.`,
        res
      );
    }

    let newUser;
    if (email && password) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      newUser = await user.create({
        name: name,
        email: email,
        password: hash,
        role: 2,
        created_date: Date.now(),
        updated_date: Date.now(),
      });
    }

    const newTeacher = await teacher.create({
      nik: nik,
      fk_class: fk_class,
      fk_user: newUser ? newUser.id : null,
      name: name,
      created_date: Date.now(),
      updated_date: Date.now(),
      createdAt: Date.now(),
    });

    if (fk_subjects && fk_subjects.length > 0) {
      await Promise.all(
        fk_subjects.map(async (subjectId) => {
          await teacher_subject.create({
            teacherId: newTeacher.pk_teacher,
            subjectId: subjectId,
            createdAt: Date.now(),
          });
        })
      );
    }

    response.successWithCustomMsg(`Berhasil membuat pengajar`, newTeacher, res);
  } catch (error) {
    response.internalServerError(error, res);
  }
};

exports.editTeacher = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().max(25).required().messages({
      "any.required": `"name" tidak boleh dikosongi`,
    }),
    fk_class: Joi.number().required().messages({
      "any.required": `"Kelas" tidak boleh dikosongi`,
    }),
    fk_subjects: Joi.array().items(Joi.number()).required().messages({
      "any.required": `"Mata pelajaran" tidak boleh dikosongi`,
    }),
    nik: Joi.number().required().messages({
      "any.required": `"NIK" tidak boleh dikosongi`,
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const { name, fk_class, fk_subjects, nik } = req.body;
  const teacherId = req.params.id;

  try {
    const existingTeacher = await teacher.findByPk(teacherId);
    if (!existingTeacher) {
      return response.errorParams(
        `Pengajar dengan ID "${teacherId}" tidak ditemukan`,
        res
      );
    }

    const teacherWithSameNIK = await teacher.findOne({
      where: { nik, pk_teacher: { [Op.ne]: teacherId } },
    });
    if (teacherWithSameNIK) {
      return response.errorParams(
        `NIK '${nik}' sudah digunakan oleh pengajar lain. Harap gunakan NIK yang berbeda.`,
        res
      );
    }

    await existingTeacher.update({
      name: name,
      fk_class: fk_class,
      fk_subjects: fk_subjects,
      nik: nik,
      updated_date: Date.now(),
    });

    await teacher_subject.destroy({
      where: {
        teacherId: teacherId,
      },
      force: true,
    });

    await Promise.all(
      fk_subjects.map(async (subjectId) => {
        await teacher_subject.create({
          teacherId: teacherId,
          subjectId: subjectId,
        });
      })
    );

    response.successWithCustomMsg(
      `Berhasil mengedit pengajar`,
      existingTeacher,
      res
    );
  } catch (error) {
    console.error(error);
    response.internalServerError(error, res);
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const existingTeacher = await teacher.findOne({
      where: { pk_teacher: req.params.id },
    });

    if (!existingTeacher) {
      return response.notFound("Pengajar tidak ditemukan", res);
    }

    await user.destroy({
      where: { id: existingTeacher.fk_user },
    });

    const deletedTeacherRows = await teacher.destroy({
      where: { pk_teacher: req.params.id },
    });

    if (deletedTeacherRows === 0) {
      return response.notFound("Pengajar tidak ditemukan", res);
    }

    response.successWithCustomMsg(`Berhasil menghapus pengajar`, {}, res);
  } catch (error) {
    console.log(error);
    response.internalServerError(error, res);
  }
};

exports.getTeacher = async (req, res) => {
  try {
    const teachers = await teacher.findAll({
      order: [["created_date", "DESC"]],
      include: [
        {
          model: classes,
          as: "class",
          attributes: ["class_name"],
        },
        {
          model: subject,
          as: "subjects",
          attributes: ["subject_name"],
          through: { attributes: [] },
        },
      ],
      raw: true,
    });

    //grouping pk_teacher
    const teacherMap = new Map();
    teachers.forEach((teacher) => {
      const pk_teacher = teacher.pk_teacher;
      if (!teacherMap.has(pk_teacher)) {
        teacherMap.set(pk_teacher, {
          pk_teacher: pk_teacher,
          nik: teacher.nik,
          name: teacher.name,
          class: teacher["class.class_name"],
          subjects: [],
        });
      }
      if (teacher["subjects.subject_name"] !== null) {
        teacherMap
          .get(pk_teacher)
          .subjects.push(teacher["subjects.subject_name"]);
      }
    });

    const transformedTeachers = Array.from(teacherMap.values());

    return response.success(transformedTeachers, res);
  } catch (error) {
    return response.internalServerError(error, res);
  }
};

exports.getTeacherByUserId = async (req, res) => {
  try {
    const teachers = await teacher.findAll({
      where: {
        fk_user: req.auth.id,
      },
      order: [["created_date", "DESC"]],
      include: [
        {
          model: classes,
          as: "class",
          // attributes: ['class_name'],
        },
        {
          model: subject,
          as: "subjects",
          attributes: ["subject_name"],
          through: { attributes: [] },
        },
      ],
      raw: true,
    });

    //grouping pk_teacher
    const teacherMap = new Map();
    teachers.forEach((teacher) => {
      const pk_teacher = teacher.pk_teacher;
      if (!teacherMap.has(pk_teacher)) {
        teacherMap.set(pk_teacher, {
          pk_teacher: pk_teacher,
          name: teacher.name,
          nik: teacher.nik,
          idClass: teacher["class.pk_class"],
          class: teacher["class.class_name"],
          subjects: [],
        });
      }
      if (teacher["subjects.subject_name"] !== null) {
        teacherMap
          .get(pk_teacher)
          .subjects.push(teacher["subjects.subject_name"]);
      }
    });

    const transformedTeachers = Array.from(teacherMap.values());

    return response.success(transformedTeachers, res);
  } catch (error) {
    return response.internalServerError(error, res);
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teachers = await teacher.findAll({
      where: {
        pk_teacher: req.params.id,
      },
      order: [["created_date", "DESC"]],
      include: [
        {
          model: classes,
          as: "class",
          // attributes: ['class_name'],
        },
        {
          model: subject,
          as: "subjects",
          // attributes: ['subject_name'],
          through: { attributes: [] },
        },
      ],
      raw: true,
    });

    //grouping pk_teacher
    const teacherMap = new Map();
    teachers.forEach((teacher) => {
      const pk_teacher = teacher.pk_teacher;
      if (!teacherMap.has(pk_teacher)) {
        teacherMap.set(pk_teacher, {
          pk_teacher: pk_teacher,
          name: teacher.name,
          nik: teacher.nik,
          idClass: teacher["class.pk_class"],
          class: teacher["class.class_name"],
          subjects: [],
        });
      }
      if (teacher["subjects.subject_name"] !== null) {
        teacherMap.get(pk_teacher).subjects.push({
          label: teacher["subjects.subject_name"],
          value: teacher["subjects.pk_subject"],
        });
      }
    });

    const transformedTeachers = Array.from(teacherMap.values());

    return response.success(transformedTeachers[0], res);
  } catch (error) {
    return response.internalServerError(error, res);
  }
};
