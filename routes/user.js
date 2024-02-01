const userControllers = require("../controllers/user");
const {auth} = require("../middlewares/auth");
const express = require ("express");
const router = express.Router();

router.get("/prueba", auth, userControllers.prueba)
router.get("/profile/:id",auth, userControllers.profile)
router.get("/list/:page", userControllers.list)
router.post("/register", userControllers.register);
router.post("/login", userControllers.login);


module.exports= router