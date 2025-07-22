const mongoose = require("mongoose");


const shopkeeperSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true, // Name is required
    },
    email: {
        type: String,
        required: true, // Email is required
        unique: true, // Ensure email is unique
        lowercase: true, // Convert email to lowercase
    },
    password: {
        type: String,
        required: true, // Password is required
    },
    fcmToken:
    {
        type: String,
        default: null
    },
},
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
)

const Shopkeeper=mongoose.model('Shopkeeper',shopkeeperSchema);

module.exports={Shopkeeper}