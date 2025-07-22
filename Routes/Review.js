const express = require("express");
const { ShopsNotReviewed, addReview, addPendingReview, deleteReview } = require("../controller/rewiewController");

const reviewRouter = express.Router();

reviewRouter.post("/reviewShop",addReview);
reviewRouter.get("/not-reviewed/:Customer_id", ShopsNotReviewed);
reviewRouter.post("/addPendingReview",addPendingReview);
reviewRouter.delete("/deleteReview",deleteReview);

module.exports = reviewRouter;
