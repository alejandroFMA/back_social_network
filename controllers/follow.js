const Follow = require("../models/Follow");
const User = require("../models/User");
const { followUsersId } = require("../services/followUsersId");

const prueba = (req, res) => {
  return res.status(200).json({
    message: "user controller",
  });
};

const create = async (req, res) => {
  const body = req.body;

  const user = req.user;

  try {
    let existingFollow = await Follow.findOne({
      user: user.id,
      followed: body.followed,
    });

    if (existingFollow) {
      return res.status(400).json({
        status: "error",
        message: "Follow already exists",
      });
    }

    let userToFollow = new Follow({
      user: user.id,
      followed: body.followed,
    });

    let followStore = await userToFollow.save();

    return res.status(200).json({
      status: "success",
      message: "Follow created",
      user: user,
      follow: followStore,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error following user" + error.message,
    });
  }
};

const unfollow = async (req, res) => {
  let userId = req.user.id;
  let followedId = req.params.id;

  try {
    let result = await Follow.findOneAndDelete({
      user: userId,
      followed: followedId,
    });

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Follow relationship not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Follow deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error deleting follow " + error.message,
    });
  }
};

const following = async (req, res) => {
  const userId = req.query.id || req.user.id;

  let page = parseInt(req.query.page, 10) || 1;

  const itemsPerPage = 5;

  try {
    let options = {
      page: page,
      limit: itemsPerPage,
      populate: [
        { path: "user", select: "-password -role -__v -email" },
        { path: "followed", select: "-password -role -__v -email" },
      ],
    };

    let follows = await Follow.paginate({ user: userId }, options);

    if (follows.docs.length == 0) {
      return res.status(400).json({
        status: "error",
        message: "There are not follows",
      });
    }

    let followUserId = await followUsersId(userId);

    return res.status(200).json({
      status: "success",
      currentPage: follows.page,
      itemsPerPage: follows.limit,
      follows: follows.docs,
      user_following: followUserId.following,
      user_following_me: followUserId.followers,
      totalDocs: follows.totalDocs,
      totalPages: follows.totalPages,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error getting following " + error.message,
    });
  }
};

const followers = async (req, res) => {
  const userId = req.query.id || req.user.id;

  let page = parseInt(req.query.page, 10) || 1;

  const itemsPerPage = 5;

  try {
    let options = {
      page: page,
      limit: itemsPerPage,
      populate: [
        { path: 'user', select: '-password -role -__v -email'}, 
        { path: 'followed', select: '-password -role -__v -email'}]
    };
    let follows = await Follow.paginate({ "followed": userId }, options);

    if (follows.docs.length == 0) {
      return res.status(400).json({
        status: "error",
        message: "There are not follows",
      });
    }

    let followUserId = await followUsersId(userId);

  return res.status(200).json({ 
    status: "success",
    currentPage: follows.page,
    itemsPerPage: follows.limit,
    follows: follows.docs,
    user_following: followUserId.following,
    user_following_me: followUserId.followers,
    totalDocs: follows.totalDocs,
    totalPages: follows.totalPages,
  });  
} catch(error){

  return res.status(500).json({
    status: "error",
    message: "Error getting following " + error.message,
  });

}
  }

module.exports = {
  prueba,
  create,
  unfollow,
  following,
  followers,
};
