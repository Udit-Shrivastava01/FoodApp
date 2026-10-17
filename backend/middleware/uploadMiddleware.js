const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createFolder(folder) {

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        });
    }
}

const productFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "products"
);

const restaurantFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "restaurants"
);

const userFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "users"
);

createFolder(productFolder);
createFolder(restaurantFolder);
createFolder(userFolder);


const storage = multer.diskStorage({

    destination: function(req, file, cb) {

        let folder = productFolder;

        if (req.uploadType === "restaurant") {
            folder = restaurantFolder;
        }

        if (req.uploadType === "user") {
            folder = userFolder;
        }

        cb(null, folder);
    },

    filename: function(req, file, cb) {

        const extension = path.extname(file.originalname);

        const filename =
            Date.now() +
            "-" +
            Math.round(Math.random() * 100000) +
            extension;

        cb(null, filename);
    }
});


const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function(req, file, cb) {

        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});


module.exports = upload;