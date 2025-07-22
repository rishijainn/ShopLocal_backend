const mongoose = require("mongoose");

const ShopReviewSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopInfo',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Review", ShopReviewSchema);
