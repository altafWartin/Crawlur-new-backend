// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Route to search local MongoDB products
router.get("/search-local", productController.searchLocalProduct);

// Route to search Amazon products
router.get("/search-amazon", productController.searchAmazonProduct);


router.get('/product/:asin', productController.fetchAndSaveProduct);

// Route to get recently added products within the last 24 hours
router.get("/recent-products", productController.getRecentProducts);

module.exports = router;
