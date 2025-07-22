const {Shopkeeper}=require("../model/Shopkeeper")
const bcrypt = require("bcryptjs");
require('dotenv').config();
const nodemailer =require("nodemailer")
const ShopInfo=require("../model/ShopInfo");


const SignUp = async (req, res) => {
    try {
        console.log("Received Body:", req.body); // ✅ Logs incoming request
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await Shopkeeper.findOne({ email });
        const existingCust=await Shopkeeper.findOne({email});
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        if(existingCust){
            return res.status(400).json({ message: "User already exists ,pls try from another email account" });
        }


        console.log("Creating User...");
        const hashedPassword = await bcrypt.hash(password, 10);
        const newShopkeeper = await Shopkeeper.create({ name, email, password: hashedPassword });

        return res.status(201).json({ message: "User registered successfully", user: newShopkeeper });

    } catch (error) {
        console.error("SignUp Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



const Login = async (req, res) => {
    const { email, password } = req.body;
    const isUser = await Shopkeeper.findOne({ email });
    if (!isUser) {
        return res.status(400).json({ message: "User is Not registered" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, isUser.password);

    if (!isPasswordCorrect) {
        console.log("yesSir")
        return res.status(401).json({
            success: false,
            message: "Wrong password"
        });
    }
    return res.status(200).json({message:"Logeed In successefully",user:isUser});
}

const UpdatePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
        // Validate input
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        const response = await Shopkeeper.findOneAndUpdate(
            { email: id },  // Find user by email
            { $set: { password: hashedPassword } },  // Update password securely
            { new: true }  // Return the updated document
        );

        // If user not found
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Update Password Error:", error); // Log error for debugging
        return res.status(500).json({
            success: false,
            message: "There was an issue, try again later",
        });
    }
};

const emailVerifiction=(req, res) => {
    const { email,otp } = req.params;
    console.log("calling the shopkeeper emailverification");
  
    // Configure the email transporter
    const transporter = nodemailer.createTransport({
        host: process.env.STMP_HOST,
        port: process.env.STMP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.STMP_USER,
          pass: process.env.UserPassword,
        },
    });
  
    // Compose the email message
    const mailOptions = {
      from: process.env.STMP_USER, 
      to: email,
      subject: 'Confirmation Email',
      text: 'Testing mail', 
      html: `<p>Thank you for registering! Please click the following link to confirm your email address here is your otp:<br/> <b>${otp}</b></p>` 
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success:true,
            message:"error is there"
        });   
      } else {
        console.log('Email sent:', info.response);
        return res.json({
            success:true,
            message:"confirmation mail sent successfully"
        })
      }
    });
  };


  const EmailValidation = async (req, res) => {
    try {
        const { email } = req.params; // Change to req.query.email if needed
        console.log("calling the shopkeeper emailvalidation");
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const response = await Shopkeeper.findOne({ email });

        if (!response) {
            return res.status(200).json({
                success: false,
                message: "This email is not registered",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email exists",
        });

    } catch (error) {
        console.error("Error in EmailValidation:", error);
        return res.status(500).json({
            success: false,
            message: "There was an issue, try again later.",
        });
    }
};




const enterShopInfo = async (req, res) => {
    const { name, no, city, address, latitude, longitude, category, pincode } = req.body;
    const { userId } = req.params;

    console.log(name, no, city, address, latitude, longitude, category, userId, pincode);

    try {
        // Create a new shop entry with GeoJSON location format
        const shop = await ShopInfo.create({
            userId,
            shopName: name,
            phone: no,
            city,
            pincode,
            address,
            category,
            location: {
                type: "Point",
                coordinates: [longitude, latitude] // 👈 Longitude first, then Latitude!
            }
        });

        return res.status(201).json({ message: "Shop information added successfully", shop });
    } catch (error) {
        console.error("Error adding shop info:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const setUserToken=async(req,res)=>{
    const {userId}=req.params;
    const {fcmToken}=req.body;
    console.log(fcmToken);

    const response = await Shopkeeper.findByIdAndUpdate(
        userId,  
        { fcmToken:  fcmToken }, // Proper update syntax
        { new: true } // Returns the updated document
      );
      console.log(response);
     
    if(!response){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
    return res.status(200).json({
        message:"fcm saved Successfully"
    })
  }





module.exports = {SignUp,Login,emailVerifiction,EmailValidation,UpdatePassword,enterShopInfo,setUserToken};
