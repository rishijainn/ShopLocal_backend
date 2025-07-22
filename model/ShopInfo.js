const mongoose = require("mongoose");

const ShopInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: "Shopkeeper",  
        required: true
    },
    shopName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    location: {   
        type: {
            type: String,
            enum: ["Point"],  
            default: "Point"
        },
        coordinates: {
            type: [Number],  // [longitude, latitude] (IMPORTANT: Longitude first!)
            required: true
        }
    },
    phone: {
        type: String,
        required: true
    },
    openingHours: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//  Create a geospatial index for fast location-based searches
ShopInfoSchema.index({ location: "2dsphere" });

const ShopInfo = mongoose.model("ShopInfo", ShopInfoSchema);

module.exports = ShopInfo;
