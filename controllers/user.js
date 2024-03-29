const bcrypt = require("bcrypt");
const User = require("../models/User");
const Follow = require("../models/Follow");
const Publication = require("../models/Publication");
const { validateUser } = require("../services/validation");
const jwt = require("../services/jwt");
const fs = require("fs");
const path = require("path");
const { followUsersId, followThisUser } = require("../services/followUsersId");

const register = async (req, res) => {
  try {
    let body = req.body;

    validateUser(body);

    body.email = body.email.toLowerCase();

    if (!body.name || !body.email || !body.password || !body.nick) {
      return res.status(400).json({
        status: "error",
        message: "Must send required data",
      });
    }
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
  let userId = req.user.id;
  let profileId = req.params.id;

  try {
    let user = await User.findById(profileId).select("-__v -password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    let follows = await followThisUser(userId, profileId);

    return res.status(200).json({
      status: "success",
      user,
      following: follows.following,
      follower: follows.followers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching info user " + error.message,
    });
  }
};

const counter = async (req, res) => {
  let userId = req.query.id || req.user.id;

  try {
    const [follows, followers, publications] = await Promise.all([
      Follow.countDocuments({ user: userId }),
      Follow.countDocuments({ followed: userId }),
      Publication.countDocuments({ user: userId }),
    ]);

    return res.status(200).json({
      status: "success",
      userId,
      follows,
      followers,
      publications,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching data" + error.message,
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
      select: "-password -email -role -__v",
    };

    let result = await User.paginate({}, options);

    if (!result.docs.length) {
      return res.status(404).json({
        status: "error",
        message: "No users found",
      });
    }

    let followUserId = await followUsersId(req.user.id);

    return res.status(200).json({
      status: "success",
      itemsPerPage,
      page,
      users: result.docs,
      user_following: followUserId.following,
      user_following_me: followUserId.followers,
      total: result.totalDocs,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching info users " + error.message,
    });
  }
};

const update = async (req, res) => {
  let userId = req.user.id;
  let body = { ...req.body };

  delete body.iat;
  delete body.exp;
  delete body.role;
  delete body.image;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: body.email }, { nick: body.nick }],
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email or nick already exists",
      });
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password;
    }

    const updatedUser = await User.findByIdAndUpdate({ _id: userId }, body, {
      new: true,
      select: "-password -__v",
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user: " + error.message,
    });
  }
};

const upload = async (req, res) => {
  let userId = req.user.id;

  if (!req.file) {
    return res.status(400).send({
      message: "No file uploaded",
    });
  }

  let image = req.file.originalname;

  let split = image.split(".");
  let extention = split[1].toLowerCase();

  if (
    extention != "png" &&
    extention != "jpg" &&
    extention != "jpeg" &&
    extention != "gif"
  ) {
    const filePath = req.file.path;
    const fileDelete = fs.unlinkSync(filePath);
    return res.status(400).json({
      status: "error",
      message: "Invalid file type: " + extention,
    });
  }

  try {
    let userUpdated = await User.findByIdAndUpdate(
      { _id: userId },
      { image: req.file.filename },
      {
        new: true,
      }
    );

    if (!userUpdated) {
      throw new Error("User not found");
    }
    return res.status(200).json({
      status: "success",
      user: userUpdated,
      file: req.file,
    });
  } catch (error) {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: "error",
      message: "Error updating image: " + error.message,
    });
  }
};

const avatar = (req, res) => {
  const file = req.params.file;

  const filePath = "./uploads/avatars/" + file;

  fs.stat(filePath, (error, exists) => {
    if (error) {
      return res.status(404).json({
        status: "error",
        message: "File does not exist",
      });
    }

    return res.sendFile(path.resolve(filePath));
  });
};

module.exports = {
  register,
  counter,
  login,
  prueba,
  profile,
  list,
  update,
  upload,
  avatar,
};
