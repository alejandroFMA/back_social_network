const userControllers = require("../controllers/user");
const express = require ("express");
const router = express.Router();


router.post("/register", userControllers.register)

module.exports= router