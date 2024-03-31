const Joi = require("joi");
const response = require("../response");
const { contacts } = require("../models");
const { Op } = require("sequelize");

function dateToEpoch2(thedate) {
  var time = thedate.getTime();
  return time - (time % 86400000);
}

exports.newMessageFromUser = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(25).required().messages({
      "any.required": `"name" tidak boleh dikosongi`,
    }),
    email: Joi.string().min(3).max(25).required().messages({
      "any.required": `"email" tidak boleh dikosongi`,
    }),
    message: Joi.string().min(3).max(250).required().messages({
      "any.required": `"message" tidak boleh dikosongi`,
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return response.errorParams(error.message, res);

  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  await contacts
    .create(
      {
        name: name,
        email: email,
        message: message,
        created_date: Date.now(),
        updated_date: Date.now(),
      },
      { raw: true }
    )
    .then(async (result) => {
      response.successWithCustomMsg(`Pesan Anda Sukses Terkirim!`, result, res);
    })
    .catch((error) => response.internalServerError(error, res));
};

exports.getAllMessageUser = async (req, res) => {
  await contacts
    .findAll({
      order: [["created_date", "DESC"]],
      raw: true,
    })
    .then(async (result) => {
      //
      const today = await contacts.findAll({
        where: {
          created_date: {
            [Op.gt]: dateToEpoch2(new Date()),
          },
        },
        raw: true,
      });

      const hasil = {
        today: today ? today.length : 0,
        alldata: result.length,
        list: result,
      };

      return response.success(hasil, res);
    })
    .catch((error) => {
      return response.internalServerError(error, res);
    });
};

exports.deleteMessageUser = async (req, res) => {
  const schema = Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": `"id" tidak boleh dikosongi`,
    }),
  });

  const { error } = schema.validate(req.params);
  if (error) return response.errorParams(error.message, res);

  const id = req.params.id;

  await contacts
    .destroy({
      where: { id: id },
    })
    .then(async (result) => {
      response.successWithCustomMsg(`Pesan berhasil dihapus`, result, res);
    })
    .catch((error) => response.internalServerError(error, res));
};
