const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("../services/jwt");

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
    });

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
    let user = await User.findOne({ email: body.email }).select({
      created_at: 0,
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    let pwd = await bcrypt.compare(body.password, user.password);

    if (!pwd) {
      return res.status(400).json({
        status: "error",
        message: "Password incorrect",
      });
    }

    // user.password = undefined;

    const token = jwt.createToken(user);

    return res.status(200).json({
      status: "success",
      user: {
        id: user._id,
        name: user.name,
        nick: user.nick,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error login " + error.message,
    });
  }
};

const prueba = (req, res) => {
  return res.status(200).json({
    message: "Prueba Token",
    user: req.user,
  });
};

const profile = async (req, res) => {
  let id = req.params.id;

  try {
    let user = await User.findById(id).select("-__v -password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching info user " + error.message,
    });
  }
};

const list = async (req, res) => {
  let page = parseInt(req.params.page, 10) || 1;
  let itemsPerPage = 5;

  try {
    const options = {
      page,
      limit: itemsPerPage,
      sort: { _id: 1 },
    };

    let result = await User.paginate({}, options);

    if (!result.docs.length) {
      return res.status(404).json({
        status: "error",
        message: "No users found",
      });
    }

    return res.status(200).json({
      status: "success",
      itemsPerPage,
      page,
      users: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching info users " + error.message,
    });
  }
}

module.exports = {
  register,
  login,
  prueba,
  profile,
  list,
};
