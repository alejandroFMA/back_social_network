const Follow = require("../models/Follow");

const followUsersId = async (userId) => {
  //le sigo?
  try {
    let following = (
      await Follow.find({ user: userId }, "followed -_id").lean()
    ).map((doc) => doc.followed); //lean convierte el resultado en formato js para poder aplicar map, si no, hrbaia que hacer un loop o un for each y sacar los datos a un array

    let followers = (
      await Follow.find({ followed: userId }, "user -_id").lean()
    ).map((doc) => doc.user);

    return {
      following,
      followers,
    };
  } catch (error) {
    throw error;
  }
};

const followThisUser = async (userId, profileId) => {
  try {
    let following = await Follow.findOne(
      { user: userId, followed: profileId }
    );

    let followers = await Follow.findOne(
      { user: profileId, followed: userId }
    );

    return {
      following,
      followers,
    };
  } catch (error) {
    throw error;
  }
};
//me sigue?

module.exports = { followUsersId, followThisUser };
