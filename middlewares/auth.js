const jwt = require("jwt-simple");
const moment = require("moment");
const { secret } = require("../services/jwt");

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "Request doesn't have header's autohorization",
    });
  }
  let token= req.headers.authorization?.split(' ')[1]
//  token = req.headers.authorization.replace(/['"]+/g, ""); //limpiar token

  try {
    let payload = jwt.decode(token, secret);

    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Expirated token",
      });
    }

    req.user = payload;

    next();
  } catch (error) {
    return res.status(403).send({
      status: "error",
      message: "invalid token " + error.message,
    });
  }
};

module.exports = { auth };
