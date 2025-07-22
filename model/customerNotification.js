const mongoose = require("mongoose");

const customerNotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: "Customer",  
        required: true
    },
    ShopId: {  // Links to the request this notification is about
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shopkeeper",
        required: true
    },
    requestId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerRequest",
        required: true

    },
    shopName: {
        type: String,
        required: true
    },
    shopAddress: {  
        type: String,
        required: true
    },
    lat: {
        type: Number
    },
    lon: {
        type: Number
    },
    shopKeeperName: {  
        type: String,
        required: true
    },
    message: {  // Custom message for the notification
        type: String,
        required: true
    },
    price:{
        type:String,
        required:true,
    },
    deliveryCost:{
        type:String,
    },
    providesDelivery:{
        type:Boolean,
        required:true,
    },
    isRead: {  // Optional: Track if the notification has been read
        type: Boolean,
        default: false
    },
    createdAt: {  
        type: Date, 
        default: Date.now  
    }
});

module.exports = mongoose.model("CustomerNotification", customerNotificationSchema);
