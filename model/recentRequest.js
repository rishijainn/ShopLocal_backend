const mongoose = require("mongoose");

const recentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer", // assuming you have a User model
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    brand: {
        type: String
    },
    imageUrl: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const recentReq = mongoose.model('recentreq', recentSchema);
module.exports = { recentReq };
