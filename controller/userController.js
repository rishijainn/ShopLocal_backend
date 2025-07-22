const { Customer } = require("../model/customer");
const bcrypt = require("bcrypt");
require('dotenv').config();
const nodemailer = require("nodemailer");
const { Shopkeeper } = require("../model/Shopkeeper");
const upload = require("./uploadimage");
const CustomerRequest = require("../model/customerRequest");
const ShopkeeperNotification = require("../model/shopkeeperNotification");
const ShopInfo = require("../model/ShopInfo");
const { default: axios } = require("axios");
const { Queue, Worker } = require("bullmq");
const Redis = require("ioredis");
const customerNotification = require("../model/customerNotification");
const customerRequest = require("../model/customerRequest");

const connection = new Redis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null
});
const RequestQueue = new Queue('customerRequests', { connection });



connection.on('error', (err) => console.error('Redis Connection Error:', err));


const SignUp = async (req, res) => {
    try {
        console.log("Received Body:", req.body); // ✅ Logs incoming request
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        const existingUser = await Customer.findOne({ email });
        const existingShopkepper = await Shopkeeper.findOne({ email });
        if (existingUser || existingShopkepper) {
            return res.status(400).json({ message: "User already exists" });
        }


        console.log("Creating User...");
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer = await Customer.create({ name, email, password: hashedPassword });

        return res.status(201).json({ message: "User registered successfully", user: newCustomer });

    } catch (error) {
        console.error("SignUp Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



const Login = async (req, res) => {
    const { email, password } = req.body;
    const isUser = await Customer.findOne({ email });
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
    return res.status(200).json({ message: "Logeed In successefully", user: isUser });
}


const UpdatePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    console.log("starting...");

    try {
        // Validate input
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        // Hash the password before saving
        console.log("hashing...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("hashing completed");
        const response = await Customer.findOneAndUpdate(
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

const emailVerifiction = (req, res) => {
    const { email, otp } = req.params;


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
                success: true,
                message: "error is there"
            });
        } else {
            console.log('Email sent:', info.response);
            return res.json({
                success: true,
                message: "confirmation mail sent successfully"
            })
        }
    });
};

const EmailValidation = async (req, res) => {
    try {
        const { email } = req.params; // Change to req.query.email if needed

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const response = await Customer.findOne({ email });

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



const createCustomerRequest = async (req, res) => {
    try {
        const { userId, itemName, brand, description, lat, lon, category} = req.body;
        const range=10;
        if (!userId || !itemName) {
            return res.status(400).json({ message: 'User ID and item name are required' });
        }

        // Use the file path from Cloudinary if available
        const imageUrl = req.file ? req.file.path : null;

        // Save the request in the database immediately
        const newRequest = new CustomerRequest({
            userId,
            itemName,
            itemImage: imageUrl,
            brand,
            description,
            lat,
            lon
        });
        await newRequest.save(); // Save to MongoDB

        // Add request to the queue for async processing
        await RequestQueue.add('newCustomerRequest', {
            requestId: newRequest._id,
            userId,
            itemName,
            brand,
            description,
            lat,
            lon,
            category,
            range
        });

        res.status(201).json({ message: 'Request created successfully', request: newRequest });

    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


async function findNearbyShops(userLat, userLon, rangeInKm,category) {
    const rangeInMeters = rangeInKm * 1000; // Convert km to meters

    const shops = await ShopInfo.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [userLon, userLat] // Longitude first!
                },
                $maxDistance: rangeInMeters
            }
        }
    }).populate('userId'); // Fetch all shopkeeper details

    return shops;
}

const requestWorker = new Worker('customerRequests', async (job) => {
    const { requestId, userId, itemName, brand, description, lat, lon, category, range } = job.data;

    console.log(`Processing customer request: ${requestId}`);

    const shops = await findNearbyShops(lat, lon, range,category);

    if (shops.length === 0) {
        console.log(`No ${category} shop available within the given range`);
        return;
    }
    console.log(shops);

    await Promise.all(shops.map(async (shopDetail) => {
        if (shopDetail.userId && shopDetail.userId.fcmToken) {
            // Send FCM notification
            await axios.post('http://localhost:4000/noti/send-notification', {
                token: shopDetail.userId.fcmToken,
                title: "New Request",
                body: `A user requires ${itemName} of brand ${brand} and description ${description}`
            });
        }

        // **Save notification in ShopkeeperNotification collection**
        try {
            const notification = new ShopkeeperNotification({
                shopkeeperId: shopDetail.userId._id,
                requestId: requestId,
                customerId: userId,
                customerName: "Anonymous User", // Change this if you have the customer's name
                message: `New request: ${itemName} (Brand: ${brand}) - ${description}`,
                isRead: false,
            });

            await notification.save();
            console.log(`Notification saved for Shopkeeper: ${shopDetail.userId._id}`);
        } catch (error) {
            console.error("Error saving shopkeeper notification:", error);
        }
    }));

    console.log("Notifications sent and saved successfully");
}, { connection });


const fetchRequest = async (req, res) => {
    const { userId } = req.params;
    console.log("enter to the backend")
    console.log(userId);
    try {
        // Validate userId
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        const response = await CustomerRequest.find({ userId: userId });
        // Check if response is empty array rather than falsy
        console.log(response);
        if (!response) {
            console.log("No requests found for this user");
            return res.status(404).json({
                success: false,
                message: "No requests found for this user"
            });
        }


        // Successfully found requests
        return res.status(200).json({
            success: true,
            response: response
        });

    } catch (error) {
        console.error("Error fetching customer requests:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching customer requests",
            error: error.message
        });
    }
};


const setUserToken = async (req, res) => {
    const { userId } = req.params;
    const { fcmToken } = req.body;
    console.log(fcmToken);

    const response = await Customer.findByIdAndUpdate(
        userId,
        { fcmToken: fcmToken }, // Proper update syntax
        { new: true } // Returns the updated document
    );
    console.log(response);

    if (!response) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
    return res.status(200).json({
        message: "fcm saved Successfully"
    })
}


const getUserFcm = async (req, res) => {
    const { userId } = req.params;

    try {
        const response = await Customer.findById(userId);
        if (!response) {
            return res.status(500).json({
                message: "no response"
            })
        }
        return res.status(200).json({
            message: "successfully fetched",
            response: response
        })

    } catch {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

const deleteAllNotifications = async (req, res) => {
    try {
        const { requestId, _id } = req.body;

        // Mark the customer's notification as read
        const response = await customerNotification.findByIdAndUpdate(
            _id,
            { isRead: true },
            { new: true } // This returns the updated document
        );
        console.log("hello looking good", response);

        // Delete all unread customer notifications for this request
        const deleteAll = await customerNotification.deleteMany({
            requestId,
            isRead: false
        });

        // Delete all shopkeeper notifications for this request
        const deleteAllShopNoti = await ShopkeeperNotification.deleteMany({
            requestId
        });

        //delete the actual request

        const deleteRequest=await customerRequest.findByIdAndDelete(requestId);
        console.log(deleteRequest);


        res.status(200).json({
            success: true,
            message: "Notifications updated and deleted successfully",
            data: {
                readUpdated: response,
                customerDeleted: deleteAll.deletedCount,
                shopkeeperDeleted: deleteAllShopNoti.deletedCount
            }
        });
    } catch (error) {
        console.error("Error deleting notifications:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting notifications",
            error: error.message
        });
    }
};
const editCustomerProfile = async (req, res) => {
    const { _id } = req.params;
    const { name, email } = req.body;

    console.log(_id,name,email);
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            _id,
            { name, email },
            { new: true } // return the updated doc
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        else{
            console.log("hello working good"," ",updatedCustomer);
        }

        res.status(200).json({
            message: "Customer profile updated successfully",
            customer: updatedCustomer,
        });
    } catch (error) {
        console.error("Error updating customer profile:", error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};




module.exports = { SignUp, Login, emailVerifiction, UpdatePassword, EmailValidation, createCustomerRequest, fetchRequest, setUserToken, getUserFcm, deleteAllNotifications,editCustomerProfile };
