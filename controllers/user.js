const User = require("../models/User");

const register = async (req, res) => {
  let body = req.body;

  if (!body.name || !body.email || !body.password || !body.nick) {
    return res.status(400).json({
      status: "error",
      message: "Must send required data",
    });
  }

  try {

    let newUser = new User(body);

    let existingUser = await User.find({
      $or: [
        { email: newUser.email.toLowerCase() },
        { nick: newUser.nick.toLowerCase() },
      ],
    }).exec();

    if (existingUser.length != 0) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }


    await newUser.save();

    return res.status(201).json({
      status: "success",
      newUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error registering user",
      error: error.message,
    });
  }
};

module.exports = {
  register,
};
