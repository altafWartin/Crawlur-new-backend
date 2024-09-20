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
  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ message: "Invalid search query" });
  }

  console.log(`Searching for products with query: "${query}"`);

  try {
    // Find multiple products matching the query within the nested `product.title` field
    const products = await AmazonProduct.find(
      {
        "product.title": new RegExp(query, "i"), // Search by `product.title` using a case-insensitive regex
      },
      {
        // Projection to include only specific fields
        "product.images_flat": 1,
        "product.title": 1,
        "product.asin": 1,
        "product.link": 1,
      }
    );

    if (products.length > 0) {
      console.log(`Found ${products.length} products`);
      return res.json(products);
    } else {
      console.log("No products found");
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
    const response = await axios.get("https://api.rainforestapi.com/request", {
      params,
    });

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
  const { asin } = req.params; // Extract 'asin' from the request parameters (URL)

  // Log 1: Start of the function

  // Check if the ASIN parameter is provided in the request
  if (!asin) {
    // If ASIN is missing, return a 400 Bad Request with an error message
    return res.status(400).json({
      success: false,
      message: "ASIN is required",
    });
  }

  try {
    // Try to find the product in the local database by its ASIN
    let product = await AmazonProduct.findOne({ "product.asin": asin });

    // If the product exists in the database
    if (product) {
      // Return the product data and a success message from the local database
      return res.status(200).json({
        success: true,
        message: "This data is from the local database",
        amazonProduct: product,
      });
    }

    // If the product is not found in the local database:
    // Send an immediate response indicating the product is being fetched from Amazon
    res.status(201).json({
      success: true,
      message: "This data is not in local database",
    });

    // If the product does not exist in the local database, proceed to fetch it from Amazon
    if (!product) {
      // Use `setImmediate` to asynchronously fetch the product from Amazon in the background
      // This prevents blocking the response to the client
      setImmediate(async () => {
        try {
          // Fetch the product from Amazon using the ASIN
          const fetchedProduct = await fetchProductFromAmazon(asin);

          // You can now add code here to save the fetched product to the local database (not shown)
          // Example: await AmazonProduct.create(fetchedProduct);
        } catch (error) {
          // Log any errors that occur during the background fetch from Amazon
          console.error(
            "Error fetching product from Amazon in background:",
            error.message
          );
        }
      });
    }
  } catch (error) {
    // Log any error that occurs during the process of fetching or saving the product
    console.error("10. Error fetching and saving product:", error);

    // Return a 500 Internal Server Error with a failure message
    return res.status(500).json({
      success: false,
      message: "Failed to fetch and save product",
    });
  }
};

const getRecentProducts = async (req, res) => {
  try {
    // Calculate the date 24 hours ago
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000); // Subtract 24 hours

    // Extract page and limit from query params with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Query for recent products
    const [recentProducts, totalProducts] = await Promise.all([
      AmazonProduct.find({ createdAt: { $gte: yesterday }, status: "Approve" })
        .skip(skip)
        .limit(limit),
      AmazonProduct.countDocuments({ createdAt: { $gte: yesterday }, status: "Approve" })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Respond with products and pagination info
    res.status(200).json({
      success: true,
      data: recentProducts,
      meta: {
        currentPage: page,
        totalPages,
        totalProducts,
        pageSize: recentProducts.length
      }
    });
  } catch (err) {
    console.error("Error fetching recent products:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getLastApprovedProducts = async (req, res) => {
  try {
    // Query for the last approved products
    const approvedProducts = await AmazonProduct.find({ status: "Approve" })
      .limit(7); // Limit to the last 10 products

    // Respond with products
    res.status(200).json({
      success: true,
      data: approvedProducts,
      meta: {
        totalProducts: approvedProducts.length
      }
    });
  } catch (err) {
    console.error("Error fetching approved products:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



module.exports = {
  searchLocalProduct,
  searchAmazonProduct,
  fetchAndSaveProduct,
  getRecentProducts,
  getLastApprovedProducts
};
