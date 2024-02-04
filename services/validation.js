const validator = require("validator");

const validatePublication = (parameters) => {
  let validateContent =
    !validator.isEmpty(parameters.text) &&
    validator.isLength(parameters.text, { min: 1, max: 140 });

  if (!validateContent) {
    throw new Error("Must containt at leats one character and a maximum of 140");
  }
};

module.exports = {
  validatePublication,
};
