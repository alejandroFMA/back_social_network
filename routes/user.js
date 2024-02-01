const userControllers = require("../controllers/user");
const express = require ("express");
const router = express.Router();

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);


module.exports= router