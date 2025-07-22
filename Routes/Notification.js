const express=require("express");
const { sendNotification } = require("../services/fcmService");
const { showShopkeeperNotifications, sendNotificationToCustomer, deleteNotificationFromShopkeeper, showRequest, markAsRead, getActiveRequest, deleteRequest, showCustomerNotifications } = require("../controller/Notification");

const notifyRouter=express.Router();

notifyRouter.post("/send-notification", async (req, res) => {
    const { token, title, body } = req.body;
    try {
      const result = await sendNotification(token, title, body);
      res.json({
        success: true,
        message: "Notification sent successfully",
        result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

 notifyRouter.get('/getShopKepperNotification/:ShopkeeperId',showShopkeeperNotifications); 

 notifyRouter.post("/sendAcceptedReq",sendNotificationToCustomer)

 notifyRouter.delete("/deleteShopNotification/:requestId",deleteNotificationFromShopkeeper);

 notifyRouter.get("/getAllNotifications/:requestId",showRequest);

 notifyRouter.patch("/markAsRead/:_id",markAsRead);

 notifyRouter.get("/getActiveRequest/:userId",getActiveRequest);

 notifyRouter.delete("/deleteRequest",deleteRequest);

 notifyRouter.get("/cutomerNotification",showCustomerNotifications);


module.exports=notifyRouter;