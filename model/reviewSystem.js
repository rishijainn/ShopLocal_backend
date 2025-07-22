const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopInfo',
        required: true
    },
    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5 
    },
    reviewed:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Review", reviewSchema);
