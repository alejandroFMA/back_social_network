const followControllers = require("../controllers/follow");
const {auth} = require("../middlewares/auth");
const express = require ("express");
const router = express.Router();


router.post("/create", auth, followControllers.create)
router.delete("/unfollow/:id", auth, followControllers.unfollow)
router.get("/following", auth, followControllers.following)
router.get("/followers", auth, followControllers.followers)


module.exports= router