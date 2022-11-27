const Router = require("express");
const { check } = require("express-validator");
const ExternalAuthController = require("../controller/ExternalAuthController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = new Router();

router.post("/signIn", ExternalAuthController.signIn);

router.get("/auth", authMiddleware, ExternalAuthController.auth);

module.exports = router;
