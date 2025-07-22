const mongoose = require("mongoose");

const customerRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        index: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemImage: {  // Optional: Image of the item
        type: String,
        default: null
    },
    brand: {  // Optional: Specific brand preference
        type: String,
        default: null
    },
    description: {  // Additional details about the request
        type: String,
        default: null
    },
    lat: {
        type: Number,
        default: null
    },
    lon: {
        type: Number,
        default: null
    },
    status: {  
        type: String,
        enum: ["pending", "accepted"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("CustomerRequest", customerRequestSchema);
