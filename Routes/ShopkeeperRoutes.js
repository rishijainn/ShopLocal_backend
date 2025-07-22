const express=require("express");
const { SignUp, Login, emailVerifiction, EmailValidation, UpdatePassword,enterShopInfo, setUserToken } = require("../controller/ShopkeeperController");

const ShRouter=express.Router();

ShRouter.post("/SignUp",SignUp);
ShRouter.post("/login",Login);
ShRouter.post("/emailVerification/:email/:otp",emailVerifiction);
ShRouter.get("/emailValidation/:email",EmailValidation);
ShRouter.patch("/updatePassword/:id",UpdatePassword);
ShRouter.post("/shopInfo/:userId",enterShopInfo);
ShRouter.post("/setFcm/:userId",setUserToken);


module.exports={ShRouter};