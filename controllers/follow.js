const Follow = require("../models/Follow");
const User = require("../models/User");

const prueba = (req, res) => {
  return res.status(200).json({
    message: "user controller",
  });
};

const create = async (req, res) => {
  const body = req.body;

  const user = req.user;

  let userToFollow = new Follow({
    user: user.id,
    followed: body.followed,
  });

  try {
    let followStore = await userToFollow.save();

    if(!followStore){
        return res.status(400).json({
            status:"error",
            message:"Error saving follow"
        })
    }

    return res.status(200).json({
      status: "success",
      message: "Follow created",
      id: user,
      follow: followStore,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error following user" + error.message,
    });
  }
};

const erase = async (req, res) => {
  return res.status(200).json({});
};

const listFollows = async (req, res) => {
  return res.status(200).json({});
};

const listFollowed = async (req, res) => {
  return res.status(200).json({});
};

module.exports = {
  prueba,
  create,
  erase,
  listFollows,
  listFollowed,
};
