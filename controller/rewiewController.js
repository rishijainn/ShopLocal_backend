const reviewSystem = require("../model/reviewSystem");

const addPendingReview = async (req, res) => {
    try {
        const { customerId, ShopkeeperId } = req.body;
        console.log("function calling");
        console.log(customerId,ShopkeeperId);
        if (!customerId || !ShopkeeperId) {
            return res.status(400).json({
                success: false,
                message: "customerId and ShopkeeperId are required"
            });
        }

        const response = await reviewSystem.create({
            customerId,
            shopId: ShopkeeperId,
            reviewed: false
        });

        return res.status(201).json({
            success: true,
            message: "Pending review added successfully",
            data: response
        });
    } catch (error) {
        console.error("Error adding pending review:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const addReview = async (req, res) => {
    try {
        const { customerId,shopId, rating } = req.body;

        if (!shopId || !rating) {
            return res.status(400).json({ error: "shopId and rating are required." });
        }

        const response = await reviewSystem.create({ shopId,customerId, rating,reviewed:true });

        return res.status(201).json({
            message: "Review added successfully",
            review: response
        });
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const ShopsNotReviewed = async (req, res) => {
    try {
        const { Customer_id } = req.params;

        const response = await reviewSystem.find({
            customerId: Customer_id,
            reviewed: false
        });
        console.log("hello calling successfully");

        return res.status(200).json({
            success: true,
            response: response
        });
    } catch (error) {
        console.error("Error fetching shops not reviewed:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body;

        if (!reviewId) {
            return res.status(400).json({ message: "Review ID is required" });
        }

        const response = await reviewSystem.findByIdAndDelete(reviewId);

        if (!response) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({ message: "Review deleted successfully", data: response });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



module.exports = { addReview,ShopsNotReviewed ,addPendingReview,deleteReview};
