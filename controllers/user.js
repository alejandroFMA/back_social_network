const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("../services/jwt")

const register = async (req, res) => {
  let body = req.body;
  body.email = body.email.toLowerCase();
  body.nick = body.nick.toLowerCase();

  if (!body.name || !body.email || !body.password || !body.nick) {
    return res.status(400).json({
      status: "error",
      message: "Must send required data",
    });
  }

  try {
    let existingUser = await User.findOne({
      $or: [{ email: body.email }, { nick: body.nick }],
    }).exec();

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    body.password = await bcrypt.hash(body.password, 10);

    let newUser = new User(body);

    await newUser.save();

    newUser.password = undefined;

    return res.status(201).json({
      status: "success",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error registering user",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  let body = req.body;

  if (!body.email || !body.password) {
    return res.status(400).json({
      status: "error",
      message: "Must send email and password",
    });
  }
  try {
    let user = await User.findOne({ email: body.email }).select({ "created_at":0}).exec()
                        
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    let pwd = await bcrypt.compare(body.password, user.password)

    if(!pwd){
        return res.status(400).json({
            status: "error",
            message: "Password incorrect"
        })
    }

    // user.password = undefined;
    const token = jwt.createToken(user);

    return res.status(200).json({
        status: "success",
        user:{
            id: user._id,
            name: user.name,
            nick:user.nick,
            image:user.image
        },
        token
    })

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error login " + error.message,
    });
  }
};

module.exports = {
  register,
  login,
};
