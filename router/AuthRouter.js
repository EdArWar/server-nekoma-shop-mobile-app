const Router = require("express");
const AuthController = require("../controller/AuthController.js");
const { check } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = new Router();

router.post(
  "/registration",
  [
    check("email", "Incorrect email").isEmail(),
    check("userName", "Username cannot be empty").notEmpty(),
    check("lastName", "LastName cannot be empty").notEmpty(),
    check(
      "password",
      "Password must be more than 4 and less than 10 characters"
    ).isLength({ min: 4, max: 10 }),
  ],
  AuthController.registration
);

router.post(
  "/login",
  [check("email", "Incorrect email").isEmail()],
  AuthController.login
);
router.get("/auth", authMiddleware, AuthController.auth);

// router.post("/role", AuthController.createRole);

module.exports = router;
