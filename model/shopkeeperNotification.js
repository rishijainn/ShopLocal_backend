const mongoose = require("mongoose");

const shopkeeperNotificationSchema = new mongoose.Schema({
    shopkeeperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shopkeeper",
        required: true,
        index: true
    },
    requestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CustomerRequest",
        required:true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    message: {  
        type: String,
        required: true
    },
    isRead: {  
        type: Boolean,
        default: false
    },
    createdAt: {  
        type: Date, 
        default: Date.now  
    }
});

module.exports = mongoose.model("ShopkeeperNotification", shopkeeperNotificationSchema);
