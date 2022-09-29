const express = require("express");
const postController = require("../controller/postController");
const verifyToken = require("../middllewares/authMiddleware");
const router = express.Router();
const { upload } = require("../lib/uploader");

router.post("/", 
verifyToken,
upload({
    acceptedFileTypes: ["png", "jpeg", "jpg", "pdf"],
    filePrefix: "POST",
}).single("post_image"),
postController.postingData);
router.get("/", postController.showAllData);
// router.post("/login", postController.loginUsers)
// router.get("/refresh-token", verifyToken, postController.refreshToken)

// router.post(
//   "/upload",
//   upload({
//     acceptedFileTypes: ["png", "jpeg", "jpg", "pdf"],
//     filePrefix: "GAMBAR",
//   }).single("post_image"),
//   (req, res) => {
//     res.status(200).json({
//       message: "Uploaded file",
//     });
//   }
// );

module.exports = router;
