const followControllers = require("../controllers/follow");
const {auth} = require("../middlewares/auth");
const express = require ("express");
const router = express.Router();


router.post("/create", auth, followControllers.create)
router.delete("/erase", followControllers.erase)
router.get("/list-follows", followControllers.listFollows)
router.get("/list-followed", followControllers.listFollowed)


module.exports= router