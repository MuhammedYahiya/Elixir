const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extName) {
    return cb(null, true);
  } else {
    return cb(new Error("Only .pdf files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
