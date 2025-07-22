const cron = require('node-cron');
const customerRequest = require('../model/customerRequest');
const shopkeeperNotification = require('../model/shopkeeperNotification');

console.log("✅ Auto-delete CRON job initialized...");

cron.schedule('0 * * * *', async () => { // runs every hour
  const now = new Date();
  const expiryTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hrs ago

  try {
    // Step 1: Find only 'pending' requests older than 24 hours
    const expiredRequests = await customerRequest.find({
      createdAt: { $lte: expiryTime },
      status: 'pending'
    });

    const expiredIds = expiredRequests.map(req => req._id);

    if (expiredIds.length === 0) {
      console.log(`[CRON] No expired pending requests found at ${new Date().toISOString()}`);
      return;
    }

    // Step 2: Delete from customerRequest
    const customerResult = await customerRequest.deleteMany({
      _id: { $in: expiredIds }
    });

    // Step 3: Delete related shopkeeper notifications
    const shopResult = await shopkeeperNotification.deleteMany({
      requestId: { $in: expiredIds }
    });

    console.log(`[CRON] ✅ Deleted ${customerResult.deletedCount} customer requests and ${shopResult.deletedCount} related shopkeeper entries at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[CRON ERROR] ❌ Cleanup failed:', err);
  }
});
