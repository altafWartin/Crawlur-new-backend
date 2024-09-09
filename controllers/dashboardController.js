const mongoose = require('mongoose');
const AmazonProduct = require('../models/AmazonProduct');

const getDashboardMetrics = async (req, res) => {
  try {
    // Calculate number of product pages published
    const publishedCount = await AmazonProduct.countDocuments({ status: 'Approve' });

    // Calculate number of new products searched
    const newProductsCount = await AmazonProduct.countDocuments({ status: 'Draft' });

    // Calculate number of thumbs up and thumbs down
    const thumbsUpCount = await AmazonProduct.countDocuments({ 'userFeedback.thumbsUp': { $gte: 1 } });
    const thumbsDownCount = await AmazonProduct.countDocuments({ 'userFeedback.thumbsDown': { $gte: 1 } });

    // Calculate number of product pages approved in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const approvedLast24Hours = await AmazonProduct.countDocuments({
      status: 'Approve',
      updatedAt: { $gte: last24Hours }
    });

    // Calculate number of product pages in review
    const inReviewCount = await AmazonProduct.countDocuments({ status: 'Draft' });

    // Calculate number of product pages to be fixed
    const toBeFixedCount = await AmazonProduct.countDocuments({ status: 'Fix' });

    // Calculate number of product pages crawled in the last 24 hours
    const crawledLast24Hours = await AmazonProduct.countDocuments({
      status: { $in: ['Crawling', 'Processing'] },
      updatedAt: { $gte: last24Hours }
    });

    // Calculate number of product pages currently processing
    const currentlyProcessingCount = await AmazonProduct.countDocuments({ status: 'Processing' });

    // Database size (approximate) using native MongoDB driver
    const db = mongoose.connection.db; // Get the native MongoDB driver instance

    // Fetch collection stats
    const stats = await db.command({
      collStats: 'amazonproducts'
    });

    // Size in MB
    const databaseSize = stats.storageSize / (1024 * 1024);

    // Send the response with all metrics
    res.status(200).json({
      success: true,
      metrics: {
        publishedCount,
        newProductsCount,
        thumbsUpCount,
        thumbsDownCount,
        approvedLast24Hours,
        inReviewCount,
        toBeFixedCount,
        crawledLast24Hours,
        currentlyProcessingCount,
        databaseSize
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
    });
  }
};

module.exports = {
  getDashboardMetrics
};
