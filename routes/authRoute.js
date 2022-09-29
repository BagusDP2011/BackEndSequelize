const express = require("express");
const { body } = require("express-validator");
const authController = require("../controller/authController");
const verifyToken = require("../middllewares/authMiddleware");
const router = express.Router();
const { upload } = require("../lib/uploader")

router.post(
  "/register",
  body("username", "Invalid username. Min 3 and contain alphanumeric")
    .isLength({ min: 3 })
    .isAlphanumeric(),
  body("email").isEmail(),
  body("password").isStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  }),
  authController.registerUser
);
router.post("/login", authController.loginUsers);
router.get("/refresh-token", verifyToken, authController.refreshToken);
router.patch(
"/me",
verifyToken,
upload({
    acceptedFileTypes: ["png", "jpeg", "jpg", "pdf"],
    filePrefix: "PROF",
}).single("profile_picture"),
authController.editUserProfile
)

module.exports = router;
