const validator = require("validator");

const validatePublication = (parameters) => {
  let validateContent =
    !validator.isEmpty(parameters.text) &&
    validator.isLength(parameters.text, { min: 1, max: 140 });

  if (!validateContent) {
    throw new Error(
      "Must containt at leats one character and a maximum of 140"
    );
  }
};

const validateUser = (parameters) => {
  let errors = [];

  if (!validator.isEmpty(parameters.name) &&
      validator.isLength(parameters.name, { min: 3 }) &&
      validator.isAlpha(parameters.name, "es-ES")) {
  } else {
    errors.push("Invalid name");
  }

  if (!validator.isEmpty(parameters.surname) &&
      validator.isLength(parameters.surname, { min: 3 }) &&
      validator.isAlpha(parameters.surname, "es-ES")) {
  } else {
    errors.push("Invalid surname");
  }

  if (!validator.isEmpty(parameters.nick) &&
      validator.isLength(parameters.nick, { min: 3 })) {
  } else {
    errors.push("Invalid nick");
  }

  if (!validator.isEmpty(parameters.email) && validator.isEmail(parameters.email)) {
  } else {
    errors.push("Invalid email");
  }

  if (!validator.isEmpty(parameters.password)) {
  } else {
    errors.push("Invalid password");
  }

  if (validator.isLength(parameters.bio || '', { max: 250 })) {
  } else {
    errors.push("Invalid bio: Must be less than 250 characters");
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  console.log("Validation passed successfully");
};


module.exports = {
  validatePublication,
  validateUser,
};
