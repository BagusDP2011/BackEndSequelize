const express = require("express")
const router = express.Router()
const { upload } = require("../lib/uploader")
const verifyToken = require("../middllewares/authMiddleware");
const transactionController = require("../controller/transactionController.js")

router.post("/", 
verifyToken,
upload({
    acceptedFileTypes: ["png", "jpeg", "jpg", "pdf"],
    filePrefix: "PROOF",
}).single("payment_proof_image_url"),
transactionController.paymentItems)

router.patch('/:id', verifyToken, transactionController.paymentStatus)
module.exports = router;
