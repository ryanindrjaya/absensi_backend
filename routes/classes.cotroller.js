const Joi = require("joi");
const response = require("../response");
const { classes } = require("../models");
const { Op } = require("sequelize");

exports.newClassess = async (req, res) => {
    const schema = Joi.object({
        class_name: Joi.string().max(25).required().messages({
            "any.required": `"name" tidak boleh dikosongi`,
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) return response.errorParams(error.message, res);

    const { class_name } = req.body;

    const existingClass = await classes.findOne({ where: { class_name } });
    if (existingClass) {
        return response.errorParams(`Kelas dengan nama ${class_name} sudah ada`, res);
    }

    await classes.create(
        {
            class_name: class_name,
            created_date: Date.now(),
            updated_date: Date.now(),
        },
        { raw: true }
    )
        .then(async (result) => {
            response.successWithCustomMsg(`Berhasil membuat kelas`, result, res);
        })
        .catch((error) => response.internalServerError(error, res));
};

exports.editClassess = async (req, res) => {
    const schema = Joi.object({
        class_name: Joi.string().max(25).required().messages({
            "any.required": `"class_name" tidak boleh dikosongi`,
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) return response.errorParams(error.message, res);

    const { class_name } = req.body;
    const classId = req.params.id;

    try {
        const existingClass = await classes.findByPk(classId);
        if (!existingClass) {
            return response.errorNotFound(`Kelas dengan ID ${classId} tidak ditemukan`, res);
        }

        const classWithSameName = await classes.findOne({
            where: {
                class_name,
                pk_class: {
                    [Op.not]: classId
                }
            }
        });
        if (classWithSameName) {
            return response.errorParams(`Kelas dengan nama ${class_name} sudah ada`, res);
        }

        await existingClass.update(
            {
                class_name,
                updated_date: Date.now(),
            }
        );

        response.successWithCustomMsg(`Berhasil mengedit kelas`, existingClass, res);
    } catch (error) {
        console.log(error)
        response.internalServerError(error, res);
    }
};

exports.deleteClasses = async (req, res) => {
    try {
        const deletedRows = await classes.destroy({
            where: {
                pk_class: req.params.id
            }
        });

        if (deletedRows === 0) {
            return response.notFound("Kelas tidak ditemukan", res);
        }

        response.successWithCustomMsg(`Berhasil menghapus kelas`, {}, res);
    } catch (error) {
        response.internalServerError(error, res);
    }
};

exports.getClass = async (req, res) => {
    await classes.findAll({
        order: [["created_date", "DESC"]],
        raw: true,
    }).then(async (result) => {
        return response.success(result, res);
    }).catch((error) => {
        return response.internalServerError(error, res);
    });
};
