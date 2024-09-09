// controllers/productController.js
const Product = require("../models/Product");
const axios = require("axios");
require("dotenv").config();
const AmazonProduct = require("../models/AmazonProduct"); // djust the path to your model
const { rewriteDescription } = require("../utils/descriptionUtils");



// Search for products in the local MongoDB database
const searchLocalProduct = async (req, res) => {
  let { query } = req.query;

  // Validate the query parameter
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ message: "Invalid search query" });
  }

  console.log(`Searching for products with query: "${query}"`);

  try {
    // Find multiple products matching the query within the nested `product.title` field
    const products = await AmazonProduct.find(
      { 
        'product.title': new RegExp(query, "i") // Search by `product.title` using a case-insensitive regex
      },
      {
        // Projection to include only specific fields
        'product.images_flat': 1,
        'product.title': 1,
        'product.asin': 1,
        'product.link': 1,
      }
    );

    if (products.length > 0) {
      console.log(`Found ${products.length} products`);
      return res.json(products);
    } else {
      console.log("No products found");
      return res.status(404).json({ message: "No products found in local database" });
    }
  } catch (error) {
    console.error("Error searching local products:", error);
    return res.status(500).json({ message: "Error searching local products" });
  }
};


const searchAmazonProduct = async (req, res) => {
  let { query, page = 1, limit = 10 } = req.query;

  // Convert page and limit to numbers
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  // Validate page and limit
  if (isNaN(page) || page < 1) {
    return res.status(400).json({ message: "Invalid page number" });
  }
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit number" });
  }

  try {
    const params = {
      api_key: process.env.API_KEY,
      type: "search",
      amazon_domain: process.env.AMAZON_DOMAIN,
      search_term: query,
      page: page, // Add pagination parameters
      page_size: limit, // Add pagination parameters
    };

    // Make the HTTP GET request to Rainforest API
    const response = await axios.get("https://api.rainforestapi.com/request", {
      params,
    });

    // Assuming the response has a 'search_results' array
    const products = response.data.search_results;

    if (products && products.length > 0) {
      return res.json({
        page,
        limit,
        total_results: response.data.total_results || products.length,
        products: products.map((product) => ({
          id: product.asin,
          title: product.title,
          link: product.link || "No description available",
          description: product.description || "No description available",
          price: product.price ? product.price.value : "Price not available",
          brand: product.brand ? product.brand : "Unknown Brand",
          category:
            product.category && product.category.length > 0
              ? product.category[0].name
              : "Unknown Category",
          imageUrl: product.image,
        })),
      });
    } else {
      return res.status(404).json({ message: "No products found on Amazon" });
    }
  } catch (error) {
    console.error("Error searching Amazon products:", error);
    return res.status(500).json({ message: "Error searching Amazon products" });
  }
};

const fetchProductFromAmazon = async (asin) => {
  try {
    // Log: Product not found, fetching from Amazon
  
    

    const params = {
      api_key: process.env.API_KEY,
      amazon_domain: process.env.AMAZON_DOMAIN,
      asin,
      type: "product",
    };

    // Make the HTTP GET request to Rainforest API
    const response = await axios.get("https://api.rainforestapi.com/request", { params });

    // Log: Received response from Rainforest API
  
    // Extract the product from the response
    const amazonProduct = response.data;



    // Log: Saving product to the database
 
    // Save product to the database
    const savedProduct = new AmazonProduct(amazonProduct);
    await savedProduct.save();

    // Log: Successfully saved product to the database

    return savedProduct;
  } catch (error) {
    // Log: Error occurred during product fetch/save
    console.error("Error fetching/saving product from Amazon:", error.message);
    throw error;
  }
};

const fetchAndSaveProduct = async (req, res) => {
  const { asin } = req.params;

  // Log 1: Start of the function

  if (!asin) {

    return res.status(400).json({
      success: false,
      message: "ASIN is required",
    });
  }

  try {
  
    // Check if the product already exists in the database
    let product = await AmazonProduct.findOne({ "product.asin": asin });

    if (product) {
 
      // Send the response immediately if the product is found
      return res.status(200).json({
        success: true,
        message: "This data is from the local database",
        amazonProduct: product,
      });
    }

  
    // Send immediate response that the product is being fetched from Amazon
    res.status(201).json({
      success: true,
      message: "This data is not in local database",
    });

    // Proceed to fetch the product and save it in the background
    setImmediate(async () => {
      try {
        const fetchedProduct = await fetchProductFromAmazon(asin);
      } catch (error) {
        console.error("Error fetching product from Amazon in background:", error.message);
      }
    });
  } catch (error) {
    // Log 10: Error occurred during the process
    console.error("10. Error fetching and saving product:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch and save product",
    });
  }
};



// Controller to get recently added products (within the last 24 hours)
const getRecentProducts = async (req, res) => {
  try {
    // Calculate the date 24 hours ago
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours

    // Query products created within the last 24 hours and have 'Approve' status
    const recentProducts = await AmazonProduct.find({
      createdAt: { $gte: yesterday },
      status: "Approve",
    });

    // Return the recent products
    res.status(200).json({ success: true, data: recentProducts });
  } catch (err) {
    console.error("Error fetching recent products:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  searchLocalProduct,
  searchAmazonProduct,
  fetchAndSaveProduct,
  getRecentProducts,
};
