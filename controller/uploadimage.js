const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: 'du5q62faw', 
    api_key: '567577443568387', 
    api_secret: 'XAmA5MN6eR_XAQ_kjQlWRxmIQ6A'
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "customer-requests",
        allowed_formats: ["jpg", "jpeg", "png"]
    }
});

const upload = multer({ storage });

module.exports = upload;
