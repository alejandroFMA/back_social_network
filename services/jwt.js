const jwt = require("jwt-simple");
const moment = require("moment");

const secret = process.env.SECRET_JWT;

const createToken = (user) =>{
    const payload= {
        id:user._id,
        name: user.name,
        surname: user.surname,
        nick:user.nick,
        role: user.role,
        email: user.email,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    return jwt.encode(payload, secret);
}

module.exports = {createToken, secret}