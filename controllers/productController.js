// controllers/productController.js
const Product = require("../models/Product");
const axios = require("axios");
require("dotenv").config();
const AmazonProduct = require("../models/AmazonProduct"); // djust the path to your model
const { rewriteDescription } = require("../utils/descriptionUtils");

// Rainforest API credentials
const API_KEY = process.env.API_KEY;
const AMAZON_DOMAIN = process.env.AMAZON_DOMAIN;

console.log("API Key:", process.env.API_KEY);
console.log("Amazon Domain:", process.env.AMAZON_DOMAIN);

// rewriteDescription("SanDisk Ultra microSDXC and microSDHC cards are fast for better pictures, app performance, and Full HD video. Ideal for Android smartphones and tablets, these A1-rated cards load apps faster for a better smartphone experience. Available in capacities up to 400GB, you have the capacity to take more pictures and Full HD video and capture life at its fullest. Built to perform in harsh conditions, SanDisk Ultra microSD cards are waterproof, temperature proof, shockproof, and X-ray proof. 1GB=1,000,000,000 bytes. Actual user storage less. (For 64GB-256GB): Up to 100MB/s read speed; write speed lower. (For 16GB-32GB): Up to 98MB/s read speed; write speed lower. Based on internal testing; performance may be lower depending on host device, interface, usage conditions and other factors. 1MB=1,000,000 bytes. (1) Full HD (1920x1080) video support may vary based upon host device, file attributes, and other factors. (2) Card only. (3) Results may vary based on host device, app type and other factors. (4) Download and installation required. (5) Based on 4.1GB transfer of photos (Average file 3.5MB) with USB 3.0 reader. Results may vary based on host device, file attributes and other factors. 6) Approximations; Results and Full HD (1920x1080) video support may vary based on host device, file attributes and other factors.");

// Search for products in the local MongoDB database
const searchLocalProduct = async (req, res) => {
  let { query } = req.query;

  console.log(`Searching`, query);
  try {
    // Find multiple products matching the query
    const products = await AmazonProduct.find(
      { title: new RegExp(query, "i") }, // Search by title using a case-insensitive regex
      {
        // Projection to include only specific fields
        images_flat: 1,
        title: 1,
        asin: 1,
        link: 1,
      }
    );

    if (products.length > 0) {
      console.log(products);
      return res.json(products);
    } else {
      return res
        .status(404)
        .json({ message: "No products found in local database" });
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

const fetchAndSaveProduct = async (req, res) => {
  const { asin } = req.params;

  try {
    // Check if the product already exists in the database
    let product = await AmazonProduct.findOne({ asin });

    if (product) {
      // If product exists, return the product data from the database with a specific message
      return res.status(200).json({
        success: true,
        message: "This data is from the local database",
        amazonProduct: product,
      });
    }

    // If product does not exist in the database, fetch it from Amazon
    const params = {
      api_key: process.env.API_KEY,
      amazon_domain: process.env.AMAZON_DOMAIN,
      asin,
      type: "product",
    };

    // Make the HTTP GET request to Rainforest API
    const response = await axios.get("https://api.rainforestapi.com/request", {
      params,
    });

    const amazonProduct = response.data.product;

    // Create a new product entry in the database
    product = new AmazonProduct(amazonProduct);
    await product.save();

    // Send response including Amazon product data
    res.status(200).json({
      success: true,
      message: "This data is from Amazon",
      amazonProduct: product,
    });
  } catch (error) {
    console.error("Error fetching and saving product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch and save product",
    });
  }
};

module.exports = {
  searchLocalProduct,
  searchAmazonProduct,
  fetchAndSaveProduct,
};
