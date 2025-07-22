const express=require("express");
const { SignUp, Login, emailVerifiction, UpdatePassword, EmailValidation, createCustomerRequest, fetchRequest, setUserToken, getUserFcm, deleteAllNotifications, editCustomerProfile } = require("../controller/userController");
const upload=require("../controller/uploadimage");



const userRouter=express.Router();

userRouter.post("/signUp",SignUp);
userRouter.post("/Login",Login);
userRouter.post("/emailVerification/:email/:otp",emailVerifiction);
userRouter.patch("/updatePassword/:id",UpdatePassword);
userRouter.get("/emailValidation/:email",EmailValidation);
userRouter.post('/create-request', upload.single('itemImage'), createCustomerRequest);
userRouter.get("/getRequest/:userId",fetchRequest);
userRouter.post("/setFcm/:userId",setUserToken);
userRouter.get("/getFcmTocken/:userId",getUserFcm);
userRouter.patch("/deleteAllNotification",deleteAllNotifications);
userRouter.patch("/updateUserProfile/:_id",editCustomerProfile);


module.exports={userRouter};