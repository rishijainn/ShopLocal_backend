const express = require("express");
const { connection } = require("./connect");
const { userRouter } = require("./Routes/userRoutes");
const { ShRouter } = require("./Routes/ShopkeeperRoutes");
const notifyRouter = require("./Routes/Notification");
require("dotenv").config();
const cors = require("cors");
const http = require("http"); // Required for socket.io
const { Server } = require("socket.io"); // Import socket.io
const reviewRouter = require("./Routes/Review");

const url = process.env.url;
const app = express();
require("./services/autoDeleteService");

// Create HTTP Server for Socket.IO



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
connection(url)
  .then(() => {
    console.log("✅ Database connected");
  })
  .catch((error) => {
    console.error("❌ Error connecting to database:", error);
  });



// Routes
app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/user", userRouter);
app.use("/Shopkeeper", ShRouter);
app.use("/noti", notifyRouter);
app.use("/review",reviewRouter);
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Server is running",
  });
});

// Start Server (Use `server.listen` instead of `app.listen`)
app.listen(4000, () => {
  console.log("🚀 Server started on port 4000");
});
