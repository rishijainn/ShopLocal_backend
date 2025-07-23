const customerNotification = require("../model/customerNotification");
const { create } = require("../model/customerRequest");
const ShopkeeperNotification = require("../model/shopkeeperNotification");
const { Customer } = require("../model/customer");
const {Queue,Worker}=require("bullmq");
const Redis = require("ioredis");
const ShopInfo = require("../model/ShopInfo");
const axios = require("axios");
const customerRequest = require("../model/customerRequest");

// const connection = new Redis({
//     host: "127.0.0.1",
//     port: 6379,
//     maxRetriesPerRequest: null
// });
const connection = new Redis({
  host: 'redis-12083.c276.us-east-1-2.ec2.redns.redis-cloud.com',
  port: 12083,
  username: 'default', 
  password: 'oikiG5y1YCsefnKpw7RBvldRx3ckgIMH',
  tls: {} ,
  maxRetriesPerRequest: null
});
const RequestQueue = new Queue('ShpReq', { connection });

connection.on('error', (err) => console.error('Redis Connection Error:', err));

const showShopkeeperNotifications = async (req, res) => {
    try {
        const { ShopkeeperId } = req.params;
        console.log(ShopkeeperId)
        if (!ShopkeeperId) {
            return res.status(400).json({
                success: false,
                messages: "no filled credentials"
            })
        }
        console.log(ShopkeeperId)
        const shopInfo=await ShopInfo.findOne({userId:ShopkeeperId});

        const response = await ShopkeeperNotification.find({ shopkeeperId: ShopkeeperId }).populate("shopkeeperId").populate("customerId");
        console.log(response);
        if (!response) {
            return res.status(400).json({
                success: false,
                messages: error

            })
        }
        return res.status(200).json({
            success: true,
            messages: "hello",
            response: response,
            shopInfo:shopInfo
            
        })



    } catch (error) {
        console.log("some error is there ");
        return res.status(500).json({
            success: false,
            messages: error

        })
    }
}
const showCustomerNotifications = async (req, res) => {
    try {
        const { CustomerId } = req.body;
        if (!CustomerId) {
            return res.json({
                success: false,
                messages: "no filled credentials"
            })
        }
        const response = await customerNotification.findOne({ customerId: CustomerId });
        if (!response) {
            return res.status(400).json({
                success: false,
                messages: error

            })
        }
        return res.status(200).json({
            success: true,
            messages: "succes",
            response: response
        })



    } catch (error) {
        console.log("some error is there ");
        return res.status(500).json({
            success: false,
            messages: error

        })
    }
}


const sendNotificationToCustomer = async (req, res) => {
    try {
        const { requestId, ShopkeeperId, customerId, messages, ShopName, lat, lon, ShopkeeperName, shopAddress, fcmToken,price,providesDelivery,deliveryCost } = req.body;
    

        // Save notification in the database
        const notification = new customerNotification({
            userId: customerId,
            ShopId: ShopkeeperId,
            requestId: requestId,
            shopName: ShopName,
            shopAddress: shopAddress,
            lat: lat,
            lon: lon,
            shopKeeperName: ShopkeeperName,
            message: messages,
            price:price,
            providesDelivery:providesDelivery,
            deliveryCost:deliveryCost
        });

        await notification.save();

        // Add job to queue for async processing
        await RequestQueue.add('newCustomerRequest', {
            requestId, ShopkeeperId, customerId, messages, ShopName, lat, lon, ShopkeeperName, shopAddress, fcmToken,price,providesDelivery,deliveryCost
        });

        return res.status(201).json({ 
            success: true, 
            message: "Your request has been successfully received! 🚀 We will notify the customer shortly."
        });
    } catch (error) {
        console.error("Error in sendNotificationToCustomer:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Oops! Something went wrong while processing your request. Please try again later." 
        });
    }
};

const requestWorker = new Worker('ShpReq', async (job) => {
    try {
        const { requestId, ShopkeeperId, customerId, messages, ShopName, lat, lon, ShopkeeperName, shopAddress, fcmToken ,price,providesDelivery,deliveryCost} = job.data;

        console.log(`📢 Processing notification for customer: ${customerId}`);
        console.log(fcmToken,messages);

        // Send FCM notification
        await customerRequest.findByIdAndUpdate(requestId,{status:"accepted"});


        const response = await axios.post('http://localhost:4000/noti/send-notification', {
            token: fcmToken,
            title: "📌 New Shopkeeper Response!",
            body: `🛍️ A shopkeeper has responded to your request: " Price ${price}". Check it out now!`
        });

        console.log(`✅ Notification successfully sent to customer ${customerId}.`);

    } catch (error) {
        console.error("⚠️ Error while sending notification:", error);
    }
}, { connection });

const deleteNotificationFromShopkeeper = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({ 
                success: false, 
                message: "Request ID is required." 
            });
        }

        const response = await ShopkeeperNotification.findByIdAndDelete(requestId);

        if (!response) {
            return res.status(404).json({ 
                success: false, 
                message: "Notification not found." 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Notification deleted successfully." 
        });

    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error. Please try again later." 
        });
    }
};


const showRequest = async (req, res) => {
    try {
        const { requestId } = req.params; 
        const notifications = await customerNotification.find({ requestId,isRead:false }); 

        console.log(notifications);

        res.status(200).json(notifications); 
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { _id } = req.params;
        console.log(_id);
        const response = await customerNotification.findByIdAndUpdate(
            _id,
            { isRead: true },
            { new: true } // This returns the updated document
        );
        console.log("hello looking good",response);

        if (!response) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification marked as read", data: response });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}; 

const getActiveRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)

        // Fetch only active requests for the given user
        const response = await customerNotification.find({ userId, isRead: true });
        console.log(response);

        

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

const deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        console.log(requestId);
        if (!requestId) {
            return res.status(400).json({ error: "requestId is required" });
        }
        const deletedRequest = await customerRequest.findByIdAndDelete(requestId);
        const deletedShNotifications = await ShopkeeperNotification.deleteMany({ requestId });
        const deletedChNotifications = await customerNotification.deleteMany({ requestId });

        console.log("delted successfully");

        return res.status(200).json({
            message: "Request and related notifications deleted successfully",
            
        });

    } catch (error) {
        console.error("Error deleting request and notifications:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};







module.exports = { showShopkeeperNotifications,sendNotificationToCustomer,deleteNotificationFromShopkeeper,showRequest,markAsRead ,getActiveRequest,deleteRequest,showCustomerNotifications};