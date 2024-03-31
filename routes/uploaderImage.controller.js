const multer = require("multer");
const maxSize = 10 * 1024 * 1024;
const maxSizeGallery = 5 * 1024 * 1024;
const { fileuploaded, tbl_foto, Sequelize } = require("../models");
const response = require("../response");

const storage = multer.diskStorage({
  //Specify the destination directory where the file needs to be saved
  destination: function (req, file, cb) {
    cb(null, "./assets/images/blog/upload");
  },
  //Specify the name of the file. The date is prefixed to avoid overwriting of files.
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];

    cb(null, req.auth.id + "_" + Date.now() + "." + extension);
  },
});

const storageGallery = multer.diskStorage({
  //Specify the destination directory where the file needs to be saved
  destination: function (req, file, cb) {
    cb(null, "./assets/images/gallery/upload");
  },
  //Specify the name of the file. The date is prefixed to avoid overwriting of files.
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];

    cb(null, req.auth.id + "_" + Date.now() + "." + extension);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Hanya format file .png, .jpg and .jpeg yang dibolehkan!")
      );
    }
  },
  limits: { fileSize: maxSize },
});

const uploadGallery = multer({
  storage: storageGallery,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Hanya format file .png, .jpg and .jpeg yang dibolehkan!")
      );
    }
  },
  limits: { fileSize: maxSizeGallery },
});

exports.uploadsingle = () => {
  return function (req, res, next) {
    upload.single("photo")(req, res, async (err) => {
      // call as a normal function
      if (err) {
        const merr =
          err.message === "File too large"
            ? "Ukuran file terlalu besar melebihi batas normal."
            : err.message;

        return response.errorParams(merr, res);
      }
      const file = req.file;
      if (!file) {
        return response.errorParams(
          "Tolong pilih file sebelum klik upload",
          res
        );
      }
      const splt = file.path.split("/");
      await fileuploaded
        .create({
          case: "blog",
          size: file.size,
          file_url: file.path,
          filename: splt[splt.length - 1],
          original_filename: file.originalname,
          mime_type: file.mimetype,
          deleted_status: 0,
          created_by: req.auth.id,
          created_date: Date.now(),
        })
        .then(() => {
          res.status(200).send({
            success: 1,
            file: file.path,
          });
        })
        .catch((error) => response.internalServerError(error, res));
    });
  };
};

exports.uploadsingleGallery = () => {
  return function (req, res, next) {
    uploadGallery.single("photo")(req, res, async (err) => {
      // call as a normal function
      if (err) {
        const merr =
          err.message === "File too large"
            ? "Ukuran file terlalu besar melebihi batas normal."
            : err.message;

        return response.errorParams(merr, res);
      }
      const file = req.file;
      if (!file) {
        return response.errorParams(
          "Tolong pilih file sebelum klik upload",
          res
        );
      }
      const splt = file.path.split("/");
      await fileuploaded
        .create({
          case: "gallery",
          size: file.size,
          file_url: file.path,
          filename: splt[splt.length - 1],
          original_filename: file.originalname,
          mime_type: file.mimetype,
          deleted_status: 0,
          created_by: req.auth.id,
          created_date: Date.now(),
        })
        .then(() => {
          next();
        })
        .catch((error) => response.internalServerError(error, res));
    });
  };
};
