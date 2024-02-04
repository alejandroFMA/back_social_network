const PublicationControllers = require("../controllers/publication");
const express = require ("express");
const {auth} = require("../middlewares/auth")
const multer = require("multer")
const router = express.Router();
const path = require('path');
const fs = require('fs');

const dir = './uploads/images/';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, files, cb) => {
        cb(null, dir);
    },
    filename:(req, files, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = files.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = "article" + uniqueSuffix + "-" + sanitizedOriginalName;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });
router.get("/prueba", PublicationControllers.prueba)
router.post("/create", auth, PublicationControllers.createPublication);
router.post("/upload-file/:id", [upload.single("file")],PublicationControllers.uploadFile);
router.get("/all/:id?", auth, PublicationControllers.list);
router.get("/image/:file", PublicationControllers.getImage);
router.get("/detail/:id", PublicationControllers.getPublicationById);
router.get("/search/:query", PublicationControllers.search);
// router.put("/:id", PublicationControllers.editPublication);
router.delete("/delete/:id", auth, PublicationControllers.deletePublication);

module.exports= router