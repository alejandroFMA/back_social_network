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
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename:(req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = "pub" + uniqueSuffix + "-" + sanitizedOriginalName;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

router.get("/prueba", PublicationControllers.prueba)
router.post("/create", auth, PublicationControllers.createPublication);
router.post("/upload/:id", [auth, upload.single("file0")],PublicationControllers.uploadFile);
router.get("/feed/:page?", auth, PublicationControllers.feed); //funciona por query ?id= &page=
router.get("/user", auth, PublicationControllers.userPublication);
router.get("/media/:file", PublicationControllers.getMedia);
router.get("/detail/:id", auth, PublicationControllers.getPublicationById);
router.get("/search/:query", PublicationControllers.search);
// router.put("/:id", PublicationControllers.editPublication);
router.delete("/delete/:id", auth, PublicationControllers.deletePublication);

module.exports= router