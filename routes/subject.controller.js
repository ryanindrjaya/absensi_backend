const Joi = require("joi");
const response = require("../response");
const { subject } = require("../models");
const { Op } = require("sequelize");

exports.newSubject = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().max(25).required().messages({
            "any.required": `"Nama pelajaran" tidak boleh dikosongi`,
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) return response.errorParams(error.message, res);

    const { name } = req.body;

    try {
        const existingSubject = await subject.findOne({ where: { subject_name: name } });
        if (existingSubject) {
            return response.errorParams(`Mata pelajaran dengan nama "${name}" sudah ada`, res);
        }

        const newSubject = await subject.create({
            subject_name: name,
            created_date: Date.now(),
            updated_date: Date.now(),
        });

        response.successWithCustomMsg(`Berhasil membuat mata pelajaran`, newSubject, res);
    } catch (error) {
        response.internalServerError(error, res);
    }
};

exports.editSubject = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().max(25).required().messages({
            "any.required": `"Nama pelajaran" tidak boleh dikosongi`,
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) return response.errorParams(error.message, res);

    const { name } = req.body;

    try {
        const existingSubject = await subject.findByPk(req.params.id);
        if (!existingSubject) {
            return response.errorParams(`Mata pelajaran dengan ID "${req.params.id}" tidak ditemukan`, res);
        }

        // Check if there's another subject with the same name but different ID
        const duplicateSubject = await subject.findOne({ where: { subject_name: name, pk_subject: { [Op.ne]: req.params.id } } });
        if (duplicateSubject) {
            return response.errorParams(`Mata pelajaran dengan nama "${name}" sudah ada`, res);
        }

        await existingSubject.update({ subject_name: name });

        response.successWithCustomMsg(`Berhasil mengedit mata pelajaran`, existingSubject, res);
    } catch (error) {
        response.internalServerError(error, res);
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const deletedRows = await subject.destroy({
            where: {
                pk_subject: req.params.id
            }
        });

        if (deletedRows === 0) {
            return response.notFound("Mata Pelajaran tidak ditemukan", res);
        }

        response.successWithCustomMsg(`Berhasil menghapus mata pelajaran`, {}, res);
    } catch (error) {
        response.internalServerError(error, res);
    }
};

exports.getSubject = async (req, res) => {
    await subject.findAll({
        order: [["created_date", "DESC"]],
        raw: true,
    }).then(async (result) => {
        return response.success(result, res);
    }).catch((error) => {
        return response.internalServerError(error, res);
    });
};
